/*
 * Curtis Compliance — Copyright © 2026 Jordan Newell. All rights reserved.
 * SPDX-License-Identifier: BUSL-1.1
 * Noncommercial production use permitted; commercial use requires a written
 * license from the author. This license converts to MIT at the Change Date —
 * full terms in LICENSE (https://mariadb.com/bsl11/).
 */

/**
 * Fixture: code that violates multiple rules.
 * - secret in code (Anthropic-style key)
 * - insecure http:// call
 * - sensitive op (payment) with no audit log
 * - sensitive data (credit_card) stored in plaintext
 * - user input (req.body) with no validation
 */
export const apiKey = 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz123456ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890xyz';
export const password = 'supersecret123';

export async function processPayment(amount: number, cc: string) {
  const res = await fetch('http://api.example.com/charge', {
    method: 'POST',
    body: JSON.stringify({ amount, credit_card: cc })
  });
  req.body.userInput;
  return res;
}
