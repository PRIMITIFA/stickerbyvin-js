export declare const VERSION: string;
export declare const BASE_URL: string;

export type ErrorCode =
  | 'missing_key' | 'invalid_key' | 'key_disabled' | 'plan_required' | 'invalid_vin' | 'unknown_vin'
  | 'sticker_not_available' | 'rate_limited' | 'quota_exceeded' | 'upstream_unavailable' | 'internal' | string;

export declare class StickerByVINError extends Error {
  status: number;
  code: ErrorCode;
  constructor(status: number, code: string, message: string);
}

export interface Vehicle {
  vin: string; year: number | null; make: string | null; model: string | null; trim: string | null; trimSource?: string | null;
  series?: string | null; bodyClass?: string | null; driveType?: string | null; engine?: string | null; fuel?: string | null;
  transmission?: string | null; doors?: string | null; plant?: string | null; manufacturer?: string | null;
  vehicleType?: string | null; gvwr?: string | null; electrification?: string | null;
}

export interface Paint {
  location: string; looksLike?: string; guideUrl?: string; codeOnFile: boolean;
  code: string | null; colorName: string | null; locked: boolean; note?: string | null;
}

export interface Availability {
  vin: string; vehicle: Vehicle;
  originalSticker: { onFile: boolean; source: string | null; tier: string | null; status: string; note: string | null };
  factoryDataSticker: { available: boolean; label: string };
  recallCount: number; paint: Paint; checkedAt: string;
}

export interface StickerOption { name: string; price: number | null; priceText: string | null; includes?: string[] }

export interface Sticker {
  vin: string; vehicle: Vehicle; source: string | null; original: boolean;
  sticker: {
    description: string | null; exteriorColor: string | null; interiorColor: string | null; engine: string | null; transmission: string | null;
    basePrice: number | null; destination: number | null; totalOptions: number | null; totalMsrp: number | null;
    fuelEconomy: { city: number | null; highway: number | null; combined: number | null } | null;
    assemblyPlant: string | null; options: StickerOption[]; discounts: { name: string; amount: number | null; priceText: string | null }[];
    standardEquipment: string[];
  };
  paint: Paint;
  pdf: { url: string; expiresAt: string };
}

export declare class StickerByVIN {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
  quotaRemaining: number | null;
  constructor(opts?: { apiKey?: string; baseUrl?: string; timeoutMs?: number });
  availability(vin: string): Promise<Availability>;
  decode(vin: string): Promise<{ vin: string; vehicle: Vehicle; recallCount: number }>;
  sticker(vin: string): Promise<Sticker>;
  stickerPdf(vin: string): Promise<Uint8Array>;
}

export default StickerByVIN;
