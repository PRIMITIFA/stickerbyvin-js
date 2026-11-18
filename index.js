/**
 * StickerByVIN window sticker API client (Node 18+, browsers, Deno, Bun; no dependencies).
 * Docs and free key: https://stickerbyvin.com/developers
 */
export const VERSION = '0.1.0';
export const BASE_URL = 'https://stickerbyvin.com/api/v1';

export class StickerByVINError extends Error {
  /**
   * @param {number} status HTTP status
   * @param {string} code missing_key, invalid_key, key_disabled, plan_required, invalid_vin, unknown_vin,
   *   sticker_not_available, rate_limited, quota_exceeded, upstream_unavailable, internal
   * @param {string} message
   */
  constructor(status, code, message) {
    super(`${status} ${code}: ${message}`);
    this.name = 'StickerByVINError';
    this.status = status;
    this.code = code;
  }
}

export class StickerByVIN {
  /** @param {{ apiKey?: string, baseUrl?: string, timeoutMs?: number }} [opts] apiKey defaults to process.env.SBV_KEY */
  constructor(opts = {}) {
    const env = typeof process !== 'undefined' && process.env ? process.env : {};
    this.apiKey = opts.apiKey || env.SBV_KEY || env.STICKERBYVIN_API_KEY;
    if (!this.apiKey) throw new Error('No API key. Pass { apiKey } or set SBV_KEY. Free key: https://stickerbyvin.com/developers');
    this.baseUrl = (opts.baseUrl || BASE_URL).replace(/\/+$/, '');
    this.timeoutMs = opts.timeoutMs ?? 30000;
    /** Calls left this month, from the last response's X-Quota-Remaining header. */
    this.quotaRemaining = null;
  }

  async #get(endpoint, vin) {
    const url = `${this.baseUrl}/${endpoint}?vin=${encodeURIComponent(String(vin).trim().toUpperCase())}`;
    const res = await fetch(url, {
      headers: { authorization: `Bearer ${this.apiKey}`, accept: 'application/json' },
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    const q = res.headers.get('x-quota-remaining');
    if (q !== null && /^\d+$/.test(q)) this.quotaRemaining = Number(q);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new StickerByVINError(res.status, body?.error?.code || 'http_error', body?.error?.message || res.statusText);
    return body;
  }

  /** Decode + whether the original window sticker is on file. All plans, 1 call. */
  availability(vin) { return this.#get('availability', vin); }

  /** Year, make, model, trim, engine, drivetrain, plant. All plans, 1 call. */
  decode(vin) { return this.#get('decode', vin); }

  /** The original window sticker as JSON (MSRP, options with prices, paint code) + a 1-hour PDF link. Starter plan and above, 1 call. */
  sticker(vin) { return this.#get('sticker', vin); }

  /** Fetch the sticker and return the original PDF as a Uint8Array. 1 call. */
  async stickerPdf(vin) {
    const s = await this.sticker(vin);
    const res = await fetch(s.pdf.url, { signal: AbortSignal.timeout(this.timeoutMs) });
    if (!res.ok) throw new StickerByVINError(res.status, 'pdf_unavailable', 'The original sticker PDF is temporarily unavailable.');
    return new Uint8Array(await res.arrayBuffer());
  }
}

export default StickerByVIN;
