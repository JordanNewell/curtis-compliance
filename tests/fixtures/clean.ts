/*
 * Curtis Compliance — Copyright © 2026 Jordan Newell. All rights reserved.
 * SPDX-License-Identifier: BUSL-1.1
 * Noncommercial production use permitted; commercial use requires a written
 * license from the author. This license converts to MIT at the Change Date —
 * full terms in LICENSE (https://mariadb.com/bsl11/).
 */

/**
 * Fixture: code that should pass all rules.
 * - no secrets (reads from env)
 * - https-only
 * - payment op WITH audit log
 * - encrypted sensitive data
 * - validated input
 */
import crypto from 'crypto';

const apiKey = process.env.API_KEY!;

export async function processPayment(amount: number, ccEncrypted: string) {
  auditLog('payment', { amount });
  const res = await fetch('https://api.example.com/charge', {
    method: 'POST',
    body: JSON.stringify({ amount, cc_cipher: crypto.createCipheriv('aes-256-gcm', Buffer.from(''), Buffer.from('')) })
  });
  return res;
}

function auditLog(event: string, data: unknown) {
  console.log(JSON.stringify({ event, data, ts: Date.now() }));
}

export const schema = { type: 'object' };
export function validate(input: unknown) {
  return schema && input;
}
