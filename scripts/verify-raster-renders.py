from __future__ import annotations
import json
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = json.loads((ROOT / 'mathematical-art/figure_registry.json').read_text())
RENDER_DIR = ROOT / '.audit-renders'
failures = []
passes = []

for fig in REGISTRY['figures']:
    if fig['status'] == 'SPECIFIED':
        continue
    src = Path(fig['master'])
    png = RENDER_DIR / f'{src.stem}-3840.png'
    if not png.exists():
        failures.append(f"{fig['id']} missing render {png.name}")
        continue
    data = png.read_bytes()
    if len(data) < 24 or data[:8] != b'\x89PNG\r\n\x1a\n':
        failures.append(f"{fig['id']} output is not a valid PNG signature")
        continue
    width, height = struct.unpack('>II', data[16:24])
    if width != 3840:
        failures.append(f"{fig['id']} raster width {width}, expected 3840")
    if height <= 0:
        failures.append(f"{fig['id']} raster height invalid: {height}")
    if len(data) < 20_000:
        failures.append(f"{fig['id']} raster unexpectedly small: {len(data)} bytes")
    if not any(msg.startswith(fig['id']) for msg in failures):
        passes.append(f"{fig['id']} {width}x{height}, {len(data)} bytes")

print(f'Raster audit: {len(passes)} passes, {len(failures)} failures')
for item in passes: print('PASS', item)
for item in failures: print('FAIL', item, file=sys.stderr)
sys.exit(1 if failures else 0)
