/*
 * Curtis Compliance — Copyright © 2026 Jordan Newell. All rights reserved.
 * SPDX-License-Identifier: BUSL-1.1
 * Noncommercial production use permitted; commercial use requires a written
 * license from the author. This license converts to MIT at the Change Date —
 * full terms in LICENSE (https://mariadb.com/bsl11/).
 */

/**
 * Fixture: code that produces only warnings (no hard failures).
 * Has user input + validation library reference, but is otherwise inert.
 */
import { z } from 'zod';

const schema = z.object({ name: z.string() });

export async function handler(req: { body: unknown }) {
  const parsed = schema.parse(req.body);
  return parsed;
}
