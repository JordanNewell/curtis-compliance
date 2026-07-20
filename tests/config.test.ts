import { mkdtemp, writeFile, mkdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { loadConfig, clearConfigCache } from '../src/config.js';

describe('loadConfig', () => {
  let originalCwd: string;
  let tempDir: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    tempDir = await mkdtemp(join(tmpdir(), 'curtis-cfg-'));
    process.chdir(tempDir);
    clearConfigCache();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await rm(tempDir, { recursive: true, force: true });
  });

  test('returns defaults when no config file', async () => {
    const cfg = await loadConfig();
    expect(cfg.framework).toBe('soc2');
    expect(cfg.blockOnFailure).toBe(true);
    expect(cfg.auditTrail).toBe(true);
    expect(cfg.skipPatterns).toContain('node_modules/**');
  });

  test('reads and merges .curtis/compliance.yaml', async () => {
    await mkdir('.curtis', { recursive: true });
    await writeFile(
      '.curtis/compliance.yaml',
      `framework: pci-dss\nblockOnFailure: false\nauditTrail: false\n`,
      'utf-8'
    );

    const cfg = await loadConfig();
    expect(cfg.framework).toBe('pci-dss');
    expect(cfg.blockOnFailure).toBe(false);
    expect(cfg.auditTrail).toBe(false);
  });

  test('default skipPatterns preserved when user omits them', async () => {
    await mkdir('.curtis', { recursive: true });
    await writeFile('.curtis/compliance.yaml', 'framework: hipaa\n');

    const cfg = await loadConfig();
    expect(cfg.skipPatterns).toContain('dist/**');
    expect(cfg.skipPatterns).toContain('*.min.js');
  });

  test('caches across calls; bustCache forces re-read', async () => {
    await mkdir('.curtis', { recursive: true });
    await writeFile('.curtis/compliance.yaml', 'framework: soc2\n');

    const first = await loadConfig();
    expect(first.framework).toBe('soc2');

    await writeFile('.curtis/compliance.yaml', 'framework: hipaa\n');

    const cached = await loadConfig();
    expect(cached.framework).toBe('soc2'); // still cached

    const fresh = await loadConfig({ bustCache: true });
    expect(fresh.framework).toBe('hipaa');
  });

  test('clearConfigCache resets the singleton', async () => {
    await mkdir('.curtis', { recursive: true });
    await writeFile('.curtis/compliance.yaml', 'framework: soc2\n');
    await loadConfig();

    await writeFile('.curtis/compliance.yaml', 'framework: pci-dss\n');
    clearConfigCache();
    const fresh = await loadConfig();
    expect(fresh.framework).toBe('pci-dss');
  });
});
