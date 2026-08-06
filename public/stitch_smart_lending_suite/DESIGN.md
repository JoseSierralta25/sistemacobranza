---
name: FinTrack
colors:
  surface: '#0c1322'
  surface-dim: '#0c1322'
  surface-bright: '#323949'
  surface-container-lowest: '#070e1d'
  surface-container-low: '#141b2b'
  surface-container: '#191f2f'
  surface-container-high: '#232a3a'
  surface-container-highest: '#2e3545'
  on-surface: '#dce2f7'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dce2f7'
  inverse-on-surface: '#293040'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb3ad'
  on-tertiary: '#68000a'
  tertiary-container: '#ff5451'
  on-tertiary-container: '#5c0008'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#0c1322'
  on-background: '#dce2f7'
  surface-variant: '#2e3545'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-base:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-padding-desktop: 32px
  container-padding-mobile: 16px
  gutter: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system is engineered for high-stakes financial environments where clarity, precision, and trust are paramount. It targets a demographic that values efficiency and data-driven decision-making. 

The aesthetic is a fusion of **Modern Minimalism** and **Corporate Reliability**. It leverages a sophisticated dark-mode default to reduce eye strain during long analytical sessions, employing heavy whitespace (even in dark mode) to prevent cognitive overload. The UI feels systematic and technical yet remains accessible through subtle depth and high-quality typography.

## Colors
The palette is anchored by a deep obsidian background to create a "void" effect that allows financial data to pop. 
- **Primary (Blue):** Used for interactive elements, focus states, and "Pending" status to denote movement or processing.
- **Success (Green):** Specifically calibrated for "Paid" statuses and positive market trends.
- **Alert (Red):** Reserved for "Overdue" accounts, critical errors, or negative financial outflows.
- **Neutrals:** A range of cool grays provides hierarchical structure to containers and borders without introducing visual noise.

## Typography
This design system utilizes **Inter** for its exceptional legibility in UI contexts and **Geist** for technical labels and data points to provide a slightly more "developer-precise" feel. 

Headlines use tight letter-spacing and heavy weights to establish a strong hierarchy. For financial figures, use the `mono-data` role to ensure tabular numbers align perfectly in lists and tables, facilitating quick scanning of currency values.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a maximum content width of 1440px. 
- **Desktop:** 12-column grid with 24px gutters.
- **Tablet:** 8-column grid with 20px gutters.
- **Mobile:** 4-column grid with 16px gutters.

Spacing follows a strict 4px base-unit scale. Content blocks should use "Stack" spacing (vertical margins) of 24px to maintain a breathable, professional rhythm. KPI cards and data tables should use consistent internal padding of 24px.

## Elevation & Depth
Depth is achieved through **Tonal Layering** and **Low-Contrast Outlines** rather than heavy shadows.
- **Level 0 (Background):** #030712 - The base canvas.
- **Level 1 (Cards/Containers):** #111827 with a 1px solid border (#374151).
- **Level 2 (Popovers/Modals):** #1F2937 with a subtle 10% opacity blue-tinted ambient shadow.

This approach creates a flat, systematic look that feels architectural and modern. Interactive elements like buttons should use a subtle inner-glow (1px stroke) to simulate a slight "lift" against the dark background.

## Shapes
The design system employs a "Rounded" geometry to soften the technical nature of financial data. 
- **Standard Components:** 0.5rem (8px) for buttons and inputs.
- **Main Containers/Cards:** 1rem (16px) to create a distinct framing for data sets.
- **Status Pills:** Fully rounded (pill-shaped) to differentiate them from interactive buttons.

## Components
### KPI Cards
Cards must feature a `label-sm` title in uppercase, a `headline-md` value, and a footer section containing the percentage trend. Use the Success color for upward trends and Alert color for downward trends. Icons should be placed in a top-right muted circle container.

### Status Chips
- **Paid:** Success background (10% opacity) with Success solid text.
- **Pending:** Primary background (10% opacity) with Primary solid text.
- **Overdue:** Alert background (10% opacity) with Alert solid text.

### Buttons
Primary buttons use a solid `#3B82F6` fill with white text. Secondary buttons use a ghost style with the `#374151` border. Active states should involve a slight brightness increase (hover) and a 2px scale-down (pressed) for tactile feedback.

### Input Fields
Inputs utilize the Surface Level 1 background with a `#374151` border. On focus, the border transitions to Primary Blue with a 2px outer glow. Labels must always be visible above the field using `label-sm`.

### Data Tables
Rows should have a subtle bottom border. Highlighting a row on hover using `#1F2937` background color is mandatory for readability in dense financial sheets.