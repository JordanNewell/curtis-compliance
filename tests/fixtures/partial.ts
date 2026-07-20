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
