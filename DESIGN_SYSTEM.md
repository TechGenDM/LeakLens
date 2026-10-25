# LeakLens — Design System & Motion Specification

## 1. Aesthetic Direction: "Swiss Editorial Financial Instrument"
Inspired by Stripe Press, Linear, Wise, and Teenage Engineering.
- **STRICTLY FORBIDDEN ("AI Slop" Ban List):**
  - NO purple, neon cyan, or magenta gradients.
  - NO glowing drop-shadows or glassmorphic floating blobs (`backdrop-blur-xl` on random cards).
  - NO generic 3-column "Feature Cards with Lucide Icons" marketing sections.
  - NO default rounded-3xl bubbly containers. Use sharp `rounded-none` or crisp `rounded-sm` (`4px`–`6px`) hardware corners.

## 2. Color Tokens (Warm Paper Ledger Default + Carbon Terminal Dark Mode)
### Light Mode (Default — "Archival Financial Ledger")
- Canvas Background: `#F6F4EE` (Warm Alabaster Paper)
- Elevated Surface / Panel: `#FDFCF9` (Crisp Ledger Sheet)
- Subtle Muted Surface: `#EFECE4` (Stone Tint)
- Primary Ink (Text): `#111315` (Deep Carbon)
- Secondary Ink (Muted Text): `#5A5D64` (Slate Graphite)
- Structural Grid Hairlines: `1px solid #DFDBD0`
- Reclaimed Money / Positive Accent: `#0D6E52` (Archival Emerald) with `#E6F4EF` surface tint
- Leak / Price Hike Alert: `#C93B2B` (International Vermilion) with `#FCECE9` surface tint
- Gray-Zone / TabPFN Warning: `#B45309` (Warm Ochre) with `#FEF3C7` surface tint

## 3. Typography Rules
- **Editorial Display (`Instrument Serif` via `next/font/google`):**
  - Use for primary financial summary statements and section headers.
  - Tracking: `-0.02em`, line-height: `1.08`.
- **UI Sans (`Plus Jakarta Sans` via `next/font/google`):**
  - Use for body copy, buttons, filter tabs, and explanations.
- **Technical Monospace (`Geist Mono` or `JetBrains Mono`):**
  - MANDATORY for all currency values, percentages, dates, raw CSV strings, and model probabilities.
  - Always apply `tabular-nums` (`font-variant-numeric: tabular-nums`) so digits align vertically and never shift width during animations.

## 4. Micro-Interaction & Animation Physics (Framer Motion)
- **Timing Rule:** All interactive transitions must complete within `160ms–320ms`. Never use slow, floaty animations.
- **Spring Config:** `{ type: "spring", stiffness: 380, damping: 32, mass: 0.8 }`
- **Required Choreographies:**
  1. **CSV Ingestion Scan:** When switching personas or uploading a CSV, show a 450ms raw-CSV monospace preview that collapses into grouped merchant rows using staggered `motion.div` (`staggerChildren: 0.03`).
  2. **Savings Odometer:** Use Framer Motion `useSpring` + `useTransform` on the "Annual Reclaimed Cash" figure so toggling a Kill-Switch smoothly rolls the digits up/down.
  3. **Tactile Kill-Switch:** Custom mechanical toggle switch with a satisfying slide + immediate strike-through effect on the monthly burn amount.
  4. **Evidence Drawer:** Smooth horizontal slide-over (`x: 24 -> 0`, `opacity: 0 -> 1`) when inspecting a merchant's transaction history and cancellation draft.\