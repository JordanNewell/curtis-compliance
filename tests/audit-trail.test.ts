import { mkdtemp, mkdir, rm, readFile, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  buildEvent,
  append,
  verify,
  query,
  exportEvents,
  AUDIT_DIR,
  CURTIS_VERSION
} from '../src/audit-trail.js';
import { complianceEngine } from '../src/compliance.js';
import type { ComplianceReport } from '../src/compliance.js';

// Catches drift between the hardcoded CURTIS_VERSION constant and the
// canonical version in package.json. Update both together when bumping.
// (Plain require is fine here — ts-jest compiles test files to CommonJS.)
const PKG_VERSION = require('../package.json').version;

describe('version sync', () => {
  test('CURTIS_VERSION matches package.json version', () => {
    expect(CURTIS_VERSION).toBe(PKG_VERSION);
  });
});

const sampleReport = (overrides: Partial<ComplianceReport> = {}): ComplianceReport => ({
  overallStatus: 'compliant',
  framework: 'pci-dss',
  timestamp: new Date().toISOString(),
  checks: [
    { requirement: 'no-secrets-in-code', status: 'pass', message: 'ok', severity: 'critical', framework: 'pci-dss' },
    { requirement: 'tls-only', status: 'pass', message: 'ok', severity: 'high', framework: 'pci-dss' }
  ],
  summary: { critical: 0, high: 0, medium: 0, low: 0, total: 2 },
  ...overrides
});

describe('audit-trail', () => {
  let originalCwd: string;
  let tempDir: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tempDir = await mkdtemp(join(tmpdir(), 'curtis-audit-'));
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('buildEvent', () => {
    test('populates required fields', () => {
      const report = sampleReport();
      const event = buildEvent(report, { commit: 'abc', author: 'jr', branch: 'main' });

      expect(event.event_type).toBe('compliance_check');
      expect(event.event_id).toMatch(/^[0-9a-f-]{36}$/);
      expect(event.commit).toBe('abc');
      expect(event.repo).toBe('local');
      expect(event.curtis_version).toBeDefined();
      expect(event.prev_hash).toBe('');
      expect(event.checks).toHaveLength(2);
    });

    test('accepts repo override', () => {
      const event = buildEvent(sampleReport(), { repo: 'acme/payments', commit: 'x', author: 'y', branch: 'z' });
      expect(event.repo).toBe('acme/payments');
    });
  });

  describe('append + query', () => {
    test('first event has empty prev_hash', async () => {
      const event = buildEvent(sampleReport(), { commit: 'c1', author: 'a', branch: 'b' });
      const written = await append(event);
      expect(written.prev_hash).toBe('');
    });

    test('second event links to first', async () => {
      await append(buildEvent(sampleReport(), { commit: 'c1', author: 'a', branch: 'b' }));
      await append(buildEvent(sampleReport(), { commit: 'c2', author: 'a', branch: 'b' }));

      const events = [];
      for await (const e of query()) events.push(e);

      expect(events).toHaveLength(2);
      expect(events[0].prev_hash).toBe('');
      expect(events[1].prev_hash.length).toBe(64); // SHA-256 hex
      expect(events[1].prev_hash).not.toBe('');
    });

    test('creates month directory on demand', async () => {
      await append(buildEvent(sampleReport(), { commit: 'c1', author: 'a', branch: 'b' }));

      // path layout: .curtis/audit/YYYY/MM/YYYY-MM-DD.jsonl
      const today = new Date();
      const yyyy = String(today.getUTCFullYear());
      const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(today.getUTCDate()).padStart(2, '0');
      const expected = join(AUDIT_DIR, yyyy, mm, `${yyyy}-${mm}-${dd}.jsonl`);

      const raw = await readFile(expected, 'utf-8');
      expect(raw.split('\n').filter(l => l.trim())).toHaveLength(1);
    });

    test('query filters by framework', async () => {
      await append(buildEvent(sampleReport({ framework: 'pci-dss' }), { commit: 'c1', author: 'a', branch: 'b' }));
      await append(buildEvent(sampleReport({ framework: 'hipaa' }), { commit: 'c2', author: 'a', branch: 'b' }));

      const hipaa = [];
      for await (const e of query({ framework: 'hipaa' })) hipaa.push(e);
      expect(hipaa).toHaveLength(1);
      expect(hipaa[0].framework).toBe('hipaa');
    });

    test('query filters by status', async () => {
      await append(buildEvent(sampleReport({ overallStatus: 'compliant' }), { commit: 'c1', author: 'a', branch: 'b' }));
      await append(buildEvent(sampleReport({ overallStatus: 'non-compliant' }), { commit: 'c2', author: 'a', branch: 'b' }));

      const failing = [];
      for await (const e of query({ status: 'non-compliant' })) failing.push(e);
      expect(failing).toHaveLength(1);
    });
  });

  describe('verify (hash chain)', () => {
    test('intact chain returns ok=true', async () => {
      for (let i = 0; i < 5; i++) {
        await append(buildEvent(sampleReport(), { commit: `c${i}`, author: 'a', branch: 'b' }));
      }
      const result = await verify();
      expect(result.ok).toBe(true);
      expect(result.events_verified).toBe(5);
    });

    test('corrupted event breaks chain', async () => {
      for (let i = 0; i < 3; i++) {
        await append(buildEvent(sampleReport(), { commit: `c${i}`, author: 'a', branch: 'b' }));
      }

      // Corrupt the middle event's overall_status. The 3rd event's prev_hash
      // still points at the *original* hash of event 2, so verification breaks.
      const today = new Date();
      const yyyy = String(today.getUTCFullYear());
      const mm = String(today.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(today.getUTCDate()).padStart(2, '0');
      const file = join(AUDIT_DIR, yyyy, mm, `${yyyy}-${mm}-${dd}.jsonl`);

      const lines = (await readFile(file, 'utf-8')).split('\n').filter(l => l.trim());
      const ev = JSON.parse(lines[1]);
      ev.overall_status = 'non-compliant';
      lines[1] = JSON.stringify(ev);
      await writeFile(file, lines.join('\n') + '\n');

      const result = await verify();
      expect(result.ok).toBe(false);
      expect(result.broken_at).toBeDefined();
      // Corrupting event 2 breaks the chain at event 3 (event 3's prev_hash
      // still points at the *original* hash of event 2, not the corrupted one).
      // Events 1 and 2 are read successfully before the break is detected.
      expect(result.events_verified).toBe(2);
    });

    test('empty chain returns ok=true, 0 events', async () => {
      const result = await verify();
      expect(result.ok).toBe(true);
      expect(result.events_verified).toBe(0);
    });
  });

  describe('exportEvents', () => {
    test('json export is a valid array', async () => {
      await append(buildEvent(sampleReport(), { commit: 'c1', author: 'a', branch: 'b' }));
      const out = await exportEvents({}, 'json');
      const parsed = JSON.parse(out);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
    });

    test('csv export has header + rows', async () => {
      await append(buildEvent(sampleReport(), { commit: 'c1', author: 'a', branch: 'b' }));
      await append(buildEvent(sampleReport(), { commit: 'c2', author: 'a', branch: 'b' }));
      const out = await exportEvents({}, 'csv');
      const lines = out.split('\n');
      expect(lines[0]).toMatch(/^timestamp,event_id,/);
      expect(lines).toHaveLength(3); // header + 2 rows
    });

    test('csv escapes commas in repo field', async () => {
      await append(buildEvent(sampleReport(), { repo: 'acme,inc/payments', commit: 'c1', author: 'a', branch: 'b' }));
      const out = await exportEvents({}, 'csv');
      expect(out).toContain('"acme,inc/payments"');
    });
  });

  describe('integration with ComplianceEngine.checkAndAudit', () => {
    test('writes audit event when auditTrail=true', async () => {
      await complianceEngine.checkAndAudit(
        {
          files: [],
          commit: 'abc123',
          author: 'tester',
          branch: 'main',
          framework: 'soc2',
          config: { blockOnFailure: true, skipPatterns: [], auditTrail: true }
        },
        { repo: 'acme/api' }
      );

      const events = [];
      for await (const e of query()) events.push(e);
      expect(events).toHaveLength(1);
      expect(events[0].repo).toBe('acme/api');
      expect(events[0].commit).toBe('abc123');
    });

    test('does NOT write when auditTrail=false', async () => {
      await complianceEngine.checkAndAudit(
        {
          files: [],
          commit: 'abc',
          author: 'x',
          branch: 'y',
          framework: 'soc2',
          config: { blockOnFailure: true, skipPatterns: [], auditTrail: false }
        },
        { repo: 'local' }
      );

      const events = [];
      for await (const e of query()) events.push(e);
      expect(events).toHaveLength(0);
    });
  });
});
