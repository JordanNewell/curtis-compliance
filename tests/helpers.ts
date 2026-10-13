/*
 * Curtis Compliance — Copyright © 2026 Jordan Newell. All rights reserved.
 * SPDX-License-Identifier: BUSL-1.1
 * Noncommercial production use permitted; commercial use requires a written
 * license from the author. This license converts to MIT at the Change Date —
 * full terms in LICENSE (https://mariadb.com/bsl11/).
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import type { ChangedFile } from '../src/compliance.js';

export async function loadFixture(name: string): Promise<ChangedFile> {
  const path = join(__dirname, 'fixtures', name);
  const content = await readFile(path, 'utf-8');
  return {
    path: `tests/fixtures/${name}`,
    content,
    diff: content,
    status: 'modified'
  };
}

export async function loadFixtures(names: string[]): Promise<ChangedFile[]> {
  return Promise.all(names.map(loadFixture));
}

export const baseConfig = {
  blockOnFailure: true,
  skipPatterns: [],
  auditTrail: false
};
