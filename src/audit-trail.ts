/**
 * Curtis Compliance Audit Trail
 *
 * Append-only, hash-chained JSONL event log. One file per day under
 * `.curtis/audit/YYYY/MM/YYYY-MM-DD.jsonl`. Each event carries a SHA-256
 * `prev_hash` field linking to the prior event's hash, so any tampering
 * is detectable via `verify()`.
 *
 * Design goals:
 *   - Cheap to write (one fs.appendFile per check)
 *   - Auditor-friendly (plain text, one JSON object per line)
 *   - Tamper-evident (hash chain)
 *
 * Non-goals for v1:
 *   - Compression / rotation of old files
 *   - Concurrent-writer locking (single-process CLI assumes exclusive write)
 */

import { createHash, randomUUID } from 'crypto';
import { readFile, mkdir, appendFile, readdir } from 'fs/promises';
import { join } from 'path';
import { createInterface } from 'readline';
import { createReadStream } from 'fs';
import type { ComplianceFramework, ComplianceReport } from './compliance.js';

export const AUDIT_DIR = '.curtis/audit';
// Kept in sync with package.json via a regression test in
// tests/audit-trail.test.ts. We don't import the JSON because ts-jest runs
// under CommonJS where import assertions aren't allowed.
export const CURTIS_VERSION = '1.2.1';

export interface AuditEventCheck {
  requirement: string;
  status: 'pass' | 'fail' | 'warn' | 'skip';
  severity: 'critical' | 'high' | 'medium' | 'low';
  file?: string;
  line?: number;
  citation?: string;
}

export interface AuditEvent {
  timestamp: string;          // ISO 8601 UTC
  event_id: string;           // UUIDv4
  event_type: 'compliance_check';
  framework: ComplianceFramework;
  repo: string;               // 'owner/name' or 'local'
  commit: string;
  author: string;
  branch: string;
  overall_status: 'compliant' | 'non-compliant' | 'partial';
  checks: AuditEventCheck[];
  summary: { critical: number; high: number; medium: number; low: number; total: number };
  curtis_version: string;
  prev_hash: string;          // SHA-256 hex of prior event's canonical JSON, '' for genesis
}

export interface VerifyResult {
  ok: boolean;
  broken_at?: { file: string; line: number; event_id: string; reason: string };
  events_verified: number;
}

/**
 * Build an AuditEvent from a ComplianceReport and run context.
 * Does NOT write to disk. Caller controls when (and whether) to persist.
 */
export function buildEvent(
  report: ComplianceReport,
  meta: { repo?: string; commit: string; author: string; branch: string },
  prevHash = ''
): AuditEvent {
  return {
    timestamp: new Date().toISOString(),
    event_id: randomUUID(),
    event_type: 'compliance_check',
    framework: report.framework,
    repo: meta.repo ?? 'local',
    commit: meta.commit,
    author: meta.author,
    branch: meta.branch,
    overall_status: report.overallStatus,
    checks: report.checks.map(c => ({
      requirement: c.requirement,
      status: c.status,
      severity: c.severity,
      file: c.location?.file,
      line: c.location?.line
    })),
    summary: report.summary,
    curtis_version: CURTIS_VERSION,
    prev_hash: prevHash
  };
}

/**
 * Canonical JSON: keys in a stable order so the hash is reproducible.
 * Excludes `prev_hash` from the hashed payload — the chain links to the
 * *envelope* of the previous event, where prev_hash is included.
 */
function canonicalHash(event: AuditEvent): string {
  const envelope = { ...event };
  return createHash('sha256')
    .update(JSON.stringify(envelope))
    .digest('hex');
}

function dayPath(date = new Date()): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return join(AUDIT_DIR, String(yyyy), mm, `${yyyy}-${mm}-${dd}.jsonl`);
}

/**
 * Read the last complete event from a JSONL file (the tail).
 * Returns null if file is missing or empty.
 */
async function readTailEvent(file: string): Promise<AuditEvent | null> {
  let raw: string;
  try {
    raw = await readFile(file, 'utf-8');
  } catch {
    return null;
  }
  const lines = raw.split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return null;
  return JSON.parse(lines[lines.length - 1]) as AuditEvent;
}

/**
 * Append an event to today's audit log. Creates month directory on demand.
 * Links to the prior event via prev_hash.
 *
 * If the event already carries a non-empty prev_hash (caller chose to set it),
 * we honor it; otherwise we read the tail of today's file and link to that.
 * Cross-day chains are intentional: prev_hash can point to yesterday's last
 * event when today's file is empty.
 */
export async function append(event: AuditEvent): Promise<AuditEvent> {
  const file = dayPath();
  const dir = file.slice(0, file.lastIndexOf('/'));
  await mkdir(dir, { recursive: true });

  let prevHash = event.prev_hash;
  if (!prevHash) {
    const tail = await readTailEvent(file);
    if (tail) {
      prevHash = canonicalHash(tail);
    } else {
      // First event ever — also try yesterday's tail so chains survive day rollover
      const yesterday = new Date(Date.now() - 86_400_000);
      const yFile = dayPath(yesterday);
      const yTail = await readTailEvent(yFile);
      prevHash = yTail ? canonicalHash(yTail) : '';
    }
  }

  const linked: AuditEvent = { ...event, prev_hash: prevHash };
  await appendFile(file, JSON.stringify(linked) + '\n', 'utf-8');
  return linked;
}

export interface QueryFilter {
  since?: string;   // ISO date or full timestamp
  until?: string;
  framework?: ComplianceFramework;
  status?: 'compliant' | 'non-compliant' | 'partial';
  repo?: string;
}

/**
 * Async-iterate matching events across all audit files in chronological order.
 * Streams — does not load the full history into memory at once.
 */
export async function* query(filter: QueryFilter = {}): AsyncIterableIterator<AuditEvent> {
  const years = await listYears();
  for (const year of years) {
    const months = (await safeReaddir(join(AUDIT_DIR, year))).sort();
    for (const month of months) {
      const dayFiles = (await safeReaddir(join(AUDIT_DIR, year, month))).sort();
      for (const dayFile of dayFiles) {
        if (!dayFile.endsWith('.jsonl')) continue;
        const file = join(AUDIT_DIR, year, month, dayFile);
        yield* streamMatching(file, filter);
      }
    }
  }
}

async function* streamMatching(file: string, filter: QueryFilter): AsyncIterableIterator<AuditEvent> {
  const rl = createInterface({ input: createReadStream(file, 'utf-8'), crlfDelay: Infinity });
  try {
    for await (const line of rl) {
      if (!line.trim()) continue;
      let event: AuditEvent;
      try {
        event = JSON.parse(line);
      } catch {
        continue;
      }
      if (filter.framework && event.framework !== filter.framework) continue;
      if (filter.status && event.overall_status !== filter.status) continue;
      if (filter.repo && event.repo !== filter.repo) continue;
      if (filter.since && event.timestamp < filter.since) continue;
      if (filter.until && event.timestamp > filter.until) continue;
      yield event;
    }
  } finally {
    rl.close();
  }
}

/**
 * Verify the hash chain end-to-end. Stops at the first broken link.
 * A break indicates either tampering or a partially-written/corrupt line.
 */
export async function verify(): Promise<VerifyResult> {
  let prevHash = '';
  let count = 0;

  for await (const event of query()) {
    count++;
    if (event.prev_hash !== prevHash) {
      return {
        ok: false,
        broken_at: {
          file: dayPath(new Date(event.timestamp)),
          line: count,
          event_id: event.event_id,
          reason: `prev_hash mismatch: expected ${prevHash.slice(0, 12)}…, got ${event.prev_hash.slice(0, 12)}…`
        },
        events_verified: count - 1
      };
    }
    prevHash = canonicalHash(event);
  }

  return { ok: true, events_verified: count };
}

/**
 * Export matching events as JSON array or CSV.
 * CSV columns: timestamp,event_id,framework,repo,commit,author,branch,overall_status,critical,high,medium,low,total
 */
export async function exportEvents(
  filter: QueryFilter,
  format: 'json' | 'csv'
): Promise<string> {
  const events: AuditEvent[] = [];
  for await (const e of query(filter)) events.push(e);

  if (format === 'json') {
    return JSON.stringify(events, null, 2);
  }

  const header = 'timestamp,event_id,framework,repo,commit,author,branch,overall_status,critical,high,medium,low,total';
  const rows = events.map(e => [
    e.timestamp,
    e.event_id,
    e.framework,
    csvEscape(e.repo),
    csvEscape(e.commit),
    csvEscape(e.author),
    csvEscape(e.branch),
    e.overall_status,
    e.summary.critical,
    e.summary.high,
    e.summary.medium,
    e.summary.low,
    e.summary.total
  ].join(','));
  return [header, ...rows].join('\n');
}

function csvEscape(s: string): string {
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

async function listYears(): Promise<string[]> {
  return (await safeReaddir(AUDIT_DIR)).filter(d => /^\d{4}$/.test(d)).sort();
}

async function safeReaddir(path: string): Promise<string[]> {
  try {
    return await readdir(path);
  } catch {
    return [];
  }
}
