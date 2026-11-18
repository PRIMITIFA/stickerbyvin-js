# stickerbyvin (JavaScript / Node)

JavaScript client for the [StickerByVIN window sticker API](https://stickerbyvin.com/developers). Give it a VIN and it returns the **original Monroney window sticker** as JSON: total MSRP, base price, every option and package with its price, colours, fuel economy, standard equipment, the factory paint code and a link to the original PDF. It has no dependencies, ships TypeScript types, and runs on Node 18+, Deno, Bun and edge runtimes.

**Get a free API key (50 calls a month) at [stickerbyvin.com/developers](https://stickerbyvin.com/developers).**

```bash
npm install stickerbyvin
# until the npm release is live:
npm install github:PRIMITIFA/stickerbyvin-js
export SBV_KEY=sbv_live_...
```

```js
import { StickerByVIN, StickerByVINError } from 'stickerbyvin';
import { writeFile } from 'node:fs/promises';

const sbv = new StickerByVIN(); // or new StickerByVIN({ apiKey: 'sbv_live_...' })
const vin = '1FTFW5L85TKD66889';

const avail = await sbv.availability(vin); // all plans
const v = avail.vehicle;
console.log(v.year, v.make, v.model, v.trim);
console.log('Original sticker on file:', avail.originalSticker.onFile);

if (avail.originalSticker.onFile) {
  try {
    const s = await sbv.sticker(vin); // Starter plan and above
    console.log('Total MSRP:', s.sticker.totalMsrp);
    for (const o of s.sticker.options) console.log(`  ${o.name}: ${o.priceText}`);
    await writeFile('window-sticker.pdf', await sbv.stickerPdf(vin));
  } catch (e) {
    if (e instanceof StickerByVINError) console.log(e.code, e.message); // e.g. plan_required
    else throw e;
  }
}
console.log('Calls left this month:', sbv.quotaRemaining);
```

Output for that real 2026 Ford F-150 Lariat:

```
2026 FORD F-150 Lariat
Original sticker on file: true
Total MSRP: 72550
  Equipment Group 501A: $2,670
  3.55 Electronic Lock Rr Axle: No charge
  7100# GVWR Package: Included
  Lariat Black Appearance Pkg: $1,475
  Tow/Haul Package: $1,010
  ...
```

## Methods

| Method | Endpoint | Plans |
|---|---|---|
| `availability(vin)` | `GET /api/v1/availability`: decode + whether the original sticker is on file | All |
| `decode(vin)` | `GET /api/v1/decode`: year, make, model, trim, engine, plant | All |
| `sticker(vin)` | `GET /api/v1/sticker`: parsed original sticker + paint code + 1-hour PDF link | Starter+ |
| `stickerPdf(vin)` | Same as `sticker`, then downloads the PDF (`Uint8Array`) | Starter+ |

Errors throw `StickerByVINError` with `.status`, `.code` and `.message`. Keep the key on the server, not in browser code. Plans, coverage and the full response format: **https://stickerbyvin.com/developers**. OpenAPI spec: https://stickerbyvin.com/openapi.json.

## For AI agents (MCP)

The same key works with the MCP server at `https://stickerbyvin.com/api/v1/mcp` (tools `check_window_sticker`, which is free, and `get_original_sticker`).

## Coverage

Original stickers come straight from the carmaker for Ford and Lincoln, GM (Chevrolet, GMC, Buick, Cadillac) 2022 and newer, most Jeep, Ram, Dodge and Chrysler from 2017 on, and Subaru 2021 and newer. Call `availability()` first.

## License

MIT
