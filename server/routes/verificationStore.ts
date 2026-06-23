/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VerificationRecord {
  emailCode: string;
  phoneCode: string;
  email: string;
  phone: string;
  expiresAt: number;
}

// In-memory registry for pending verification codes before user registration is completed
export const registerCodes = new Map<string, VerificationRecord>();
