from __future__ import annotations
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
registry = json.loads((ROOT / 'mathematical-art/figure_registry.json').read_text())
tokens = json.loads((ROOT / 'mathematical-art/design_tokens.json').read_text())
failures: list[str] = []
warnings: list[str] = []
passes: list[str] = []

MIN_FONT = float(tokens['rules']['minimumTextSizeAt2400'])
REC_FONT = float(tokens['rules']['recommendedTextSizeAt2400'])
MIN_CONTRAST = float(tokens['rules']['minimumContrastTarget'])

def rgb(hex_color: str):
    h = hex_color.lstrip('#')
    return tuple(int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4))

def luminance(hex_color: str):
    out = []
    for x in rgb(hex_color):
        out.append(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4)
    return 0.2126 * out[0] + 0.7152 * out[1] + 0.0722 * out[2]

def contrast(a: str, b: str):
    l1, l2 = luminance(a), luminance(b)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)

def numeric_font_size(raw: str | None):
    if raw is None:
        return None
    m = re.fullmatch(r'([0-9]+(?:\.[0-9]+)?)', raw.strip())
    return float(m.group(1)) if m else None

bg = tokens['semanticColors']['background']
for name in ['text', 'muted', 'source', 'derived', 'model', 'computed', 'verified', 'empirical', 'hypothesis', 'target']:
    ratio = contrast(tokens['semanticColors'][name], bg)
    if ratio < MIN_CONTRAST:
        failures.append(f'palette {name} contrast {ratio:.2f} < {MIN_CONTRAST:.2f}')
    else:
        passes.append(f'palette {name} contrast {ratio:.2f}')

for fig in registry['figures']:
    if fig['status'] == 'SPECIFIED':
        continue
    master = ROOT / fig['master']
    try:
        tree = ET.parse(master)
    except Exception as exc:
        failures.append(f"{fig['id']} XML parse failed: {exc}")
        continue
    root = tree.getroot()
    if not root.tag.endswith('svg'):
        failures.append(f"{fig['id']} root element is not svg")
    title = next((e for e in root.iter() if e.tag.endswith('title')), None)
    desc = next((e for e in root.iter() if e.tag.endswith('desc')), None)
    if title is None or not ''.join(title.itertext()).strip():
        failures.append(f"{fig['id']} empty/missing title")
    if desc is None or not ''.join(desc.itertext()).strip():
        failures.append(f"{fig['id']} empty/missing desc")

    stats = {'text_count': 0, 'below_recommended': 0}

    def walk(elem, inherited_font: str | None = None):
        effective_raw = elem.attrib.get('font-size', inherited_font)
        if elem.tag.endswith('text'):
            stats['text_count'] += 1
            value = numeric_font_size(effective_raw)
            if effective_raw is None:
                failures.append(f"{fig['id']} text element has no effective font-size")
            elif value is None:
                failures.append(f"{fig['id']} non-numeric effective font-size {effective_raw!r}")
            elif value < MIN_FONT:
                failures.append(f"{fig['id']} font-size {value:g} < hard minimum {MIN_FONT:g}")
            elif value < REC_FONT:
                stats['below_recommended'] += 1
        for child in elem:
            walk(child, effective_raw)

    walk(root)
    if stats['text_count'] == 0:
        failures.append(f"{fig['id']} contains no text labels")
    else:
        passes.append(f"{fig['id']} parsed with {stats['text_count']} text labels")
    if stats['below_recommended']:
        warnings.append(f"{fig['id']} has {stats['below_recommended']} labels below recommended {REC_FONT:g} user-units (all still >= hard minimum)")

print(f'SVG/XML audit: {len(passes)} passes, {len(warnings)} warnings, {len(failures)} failures')
for item in passes:
    print('PASS', item)
for item in warnings:
    print('WARN', item)
for item in failures:
    print('FAIL', item, file=sys.stderr)
sys.exit(1 if failures else 0)
