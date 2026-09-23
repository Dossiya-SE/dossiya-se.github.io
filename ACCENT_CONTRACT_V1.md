# LIGHT-SKY-BLUE-ACCENT-V1

This repository uses the RGB model in the sRGB color space.

## Governing replacement

The historical gold / amber / ochre accent role is replaced by the Light Sky Blue family.

| Role | RGB | Hex | Use |
|---|---:|---|---|
| Primary accent | `(135, 206, 250)` | `#87CEFA` | interface, decision, highlight, callout, accent geometry |
| Strong accent | `(0, 191, 255)` | `#00BFFF` | hover, bright emphasis, dark-background highlight |
| Light graphic companion | `(45, 143, 214)` | `#2D8FD6` | meaningful lines/borders on light backgrounds |
| Light text companion | `(40, 120, 205)` | `#2878CD` | normal-size text on white/light backgrounds |
| Dark text companion | `(191, 232, 255)` | `#BFE8FF` | labels and text on dark backgrounds |

Alpha tokens:
- soft: `rgba(135,206,250,0.18)`
- soft-2: `rgba(135,206,250,0.10)`
- glow: `rgba(0,191,255,0.28)`
- border: `rgba(135,206,250,0.55)`

## Scientific semantic system

- Power → red
- Transportation → green
- Information → blue
- Organization → magenta
- Mathematical abstraction → violet
- Interface / decision / highlight / accent → Light Sky Blue
- Viability → green
- Critical boundary / disturbance → red

Color is never the sole scientific encoding. Labels, geometry, line patterns and direction remain authoritative.

## Accessibility

`#87CEFA` is the identity accent, but it does not have sufficient contrast for ordinary text on white. The governed light-background companions are therefore used where contrast is required:

- `#2D8FD6` for meaningful graphics / large emphasis
- `#2878CD` for normal-size text
- `#BFE8FF` for text on dark surfaces

## Forbidden accent families

Do not use gold, amber, ochre, yellow-gold, goldenrod, or historical warm-accent tokens as governed visual accents. CI rejects prohibited warm-hue RGB values and legacy gold-family tokens in release-critical visual files.
