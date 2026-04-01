# Curator AI Builder — Design System

> Source of truth extracted from Stitch project `17024109980658263055`
> Creative North Star: "The Digital Curator" — Light Mode with Sapphire accents

---

## Color Architecture

### Primary — Sapphire
| Token | Hex | Usage |
|:---|:---|:---|
| `--primary` | `#0058be` | Primary actions, links, focus rings |
| `--primary-container` | `#2170e4` | Hover states, lighter accents |
| `--primary-gradient` | `linear-gradient(15deg, #0058be, #2170e4)` | CTA buttons, hero accents |

### Surface Hierarchy (Light)
| Token | Hex | Usage |
|:---|:---|:---|
| `--surface` | `#f8f9fa` | Page background, canvas area |
| `--surface-low` | `#f3f4f5` | Subtle sections, card backgrounds |
| `--surface-container` | `#edeeef` | Panels, sidebars, input backgrounds |
| `--surface-high` | `#e7e8e9` | Hover states on surfaces |
| `--surface-highest` | `#e1e3e4` | Active/pressed states |
| `--surface-lowest` | `#ffffff` | Cards, elevated surfaces, modals |

### On-Surface (Text)
| Token | Hex | Usage |
|:---|:---|:---|
| `--on-surface` | `#191c1d` | Primary text, headings |
| `--on-surface-variant` | `#424754` | Secondary text, descriptions |
| `--on-surface-outline` | `#727785` | Placeholder text, disabled states |

### Functional
| Token | Hex | Usage |
|:---|:---|:---|
| `--on-primary` | `#ffffff` | Text on primary buttons |
| `--outline` | `#c4c6c9` | Borders, dividers |
| `--outline-variant` | `#dfe1e3` | Subtle borders |
| `--error` | `#ba1a1a` | Error states |
| `--error-container` | `#ffdad6` | Error backgrounds |
| `--success` | `#1b6d3c` | Success states |

---

## Typography

### Font Family
- **Primary:** Plus Jakarta Sans (weights: 300, 400, 500, 600, 700, 800)
- **Icons:** Material Symbols Outlined (`'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`)

### Scale
| Role | Size | Weight | Tracking |
|:---|:---|:---|:---|
| Page Title | 24px / 1.5rem | 700 | -0.02em |
| Section Title | 18px / 1.125rem | 600 | -0.01em |
| Body | 14px / 0.875rem | 400 | normal |
| Small / Label | 12px / 0.75rem | 500 | 0.02em |
| Micro / Badge | 10px / 0.625rem | 600 | 0.04em |
| Mono (code) | 13px / 0.8125rem | 400 | normal |

---

## Spacing & Layout

### Spacing Scale
| Token | Value |
|:---|:---|
| xs | 4px |
| sm | 8px |
| md | 12px |
| lg | 16px |
| xl | 24px |
| 2xl | 32px |
| 3xl | 48px |

### Border Radius
| Token | Value |
|:---|:---|
| `--radius-sm` | 2px |
| `--radius-default` | 4px |
| `--radius-md` | 8px |
| `--radius-lg` | 12px |
| `--radius-xl` | 16px |
| `--radius-2xl` | 24px |
| `--radius-full` | 9999px |

---

## Elevation & Shadows

| Level | Shadow | Usage |
|:---|:---|:---|
| `shadow-ambient` | `0px 24px 48px -12px rgba(25, 28, 29, 0.06)` | Canvas, cards |
| `shadow-sm` | `0px 1px 3px rgba(25, 28, 29, 0.04)` | Buttons, inputs |
| `shadow-md` | `0px 4px 12px rgba(25, 28, 29, 0.08)` | Dropdowns, popovers |
| `shadow-lg` | `0px 8px 24px rgba(25, 28, 29, 0.12)` | Modals, overlays |

---

## Effects

### Glassmorphism
```css
.glass-nav {
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
```

### AI Pulse Animation
```css
@keyframes ai-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}
/* Duration: 2.5s, cubic-bezier easing */
```

### Custom Scrollbar
```css
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #c4c6c9; border-radius: 2px; }
```

---

## Component Patterns

### Buttons
- **Primary:** `background: var(--primary-gradient)`, white text, `border-radius: 12px`, `padding: 10px 24px`
- **Secondary/Ghost:** Transparent bg, `text-on-surface-variant`, hover: `bg-surface-container`
- **Outline:** `border: 1px solid var(--outline)`, transparent bg

### Cards
- Background: `--surface-lowest` (white)
- Border radius: `12px`
- Shadow: `shadow-ambient`
- Padding: `24px`
- Hover: subtle shadow increase + `translateY(-1px)`

### Input Fields
- Background: `--surface-low`
- Border: `1px solid var(--outline-variant)`
- Focus: `ring: 2px solid var(--primary) / 20%`
- Border radius: `8px`
- Height: `36px` (sm), `40px` (md)

### Panels (Sidebar, Inspector)
- Background: `--surface-lowest` (white)
- Width: Left sidebar `260px`, Right panel `360px`
- Tab height: `40px`
- Collapsed width: `48px`

### Canvas
- Background: `--surface` with dot-grid pattern
- Page frame: white with `shadow-ambient`, `border-radius: 12px`
- Max width: `1200px`

---

## Icon System

**Font:** Material Symbols Outlined
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />
```

**Usage:** `<span class="material-symbols-outlined">icon_name</span>`

**Common icons:** dashboard, add, edit, delete, visibility, save, undo, redo,
sidebar, menu, close, search, send, auto_awesome, palette, layers,
code, format_bold, format_italic, content_copy, expand_more, chevron_right

---

## Screens Reference

| Screen | File | Description |
|:---|:---|:---|
| AI Dashboard | `curator-ai-dashboard.html` | Homepage with project cards grid, workspace overview |
| AI Builder | `curator-ai-builder.html` | Main builder: header, sidebar layers, canvas, inspector |
| Detailed Builder | `detailed-curator-ai-builder.html` | Expanded layers, dot-grid canvas, rulers |
| Style Manager | `curator-style-manager.html` | Color architecture, typography system, component grids |
| AI Chatbot | `curator-ai-chatbot.html` | AI chat with message bubbles, quick actions, code blocks |
