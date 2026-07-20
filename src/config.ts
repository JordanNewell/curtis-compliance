/**
 * Curtis Compliance Configuration
 */

import { readFile } from 'fs/promises';
import { ComplianceFramework } from './compliance.js';
import * as yaml from 'js-yaml';

export interface CurtisConfig {
  framework: ComplianceFramework;
  blockOnFailure: boolean;
  skipPatterns: string[];
  auditTrail: boolean;
  rules?: Record<string, {
    enabled: boolean;
    blockOnFail?: boolean;
  }>;
}

let cachedConfig: CurtisConfig | null = null;

export async function loadConfig(options: { bustCache?: boolean } = {}): Promise<CurtisConfig> {
  if (cachedConfig && !options.bustCache) {
    return cachedConfig;
  }

  const defaultConfig: CurtisConfig = {
    framework: 'soc2',
    blockOnFailure: true,
    skipPatterns: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.min.js',
      '*.min.css',
      '.git/**'
    ],
    auditTrail: true
  };

  try {
    const content = await readFile('.curtis/compliance.yaml', 'utf-8');
    const userConfig = yaml.load(content) as Partial<CurtisConfig>;
    cachedConfig = { ...defaultConfig, ...userConfig };
    return cachedConfig;
  } catch (error) {
    // No config file, use defaults
    cachedConfig = defaultConfig;
    return defaultConfig;
  }
}

export function clearConfigCache(): void {
  cachedConfig = null;
}
