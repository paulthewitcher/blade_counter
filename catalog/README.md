# Blade Counter catalog

This directory is the editable anagraphics of the user's owned parts. It is intentionally isolated from React UI code.

## Files

- `systems.json`: supported Beyblade systems and their enabled/required slots.
- `blades.json`: blade parts.
- `ratchets.json`: ratchet parts.
- `bits.json`: bit parts.
- `lock_cips.json`: lock cip parts.
- `sub_blades.json`: optional sub blade parts.

## Part schema

Every part follows the same shape:

```json
{
  "id": "stable_id",
  "name": "Human readable name",
  "image": "parts/example.png",
  "system": "BX",
  "stats": {
    "attack": 10,
    "defence": 5,
    "stamina": 12
  },
  "details": {
    "type": "balance",
    "spin direction": "right"
  },
  "tags": ["balance"]
}
```

`stats` contains only numeric values and is restricted by `src/config/stats.js`. Missing stats are equivalent to zero. `details` contains qualitative metadata and is restricted by `src/config/details.js`. `image` is optional; missing/broken images fall back to `/default.png` through the app's Pages-safe base URL.

## System slot schema

A system slot uses both flags:

```json
"subBlade": {
  "enabled": true,
  "required": false
}
```

- `enabled: true` means the system exposes the selector.
- `required: true` means a valid Beyblade must select a part in that slot.

This allows 3-, 4- and 5-part systems without hard-coding the rules in the UI.
