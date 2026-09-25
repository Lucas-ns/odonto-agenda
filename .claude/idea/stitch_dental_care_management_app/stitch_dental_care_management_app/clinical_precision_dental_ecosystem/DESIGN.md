---
name: Clinical Precision Dental Ecosystem
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3f4850'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
---

## Brand & Style
The design system embodies a synthesis of clinical rigor, ergonomic efficiency, and patient-centered warmth. Tailored for dental surgeons, hygienists, clinic administrators, and patients, the visual environment balances dense odontological charting with instantaneous legibility.

The design philosophy unites Modern Corporate SaaS with Tactile Warmth:
- **Clinical Serenity:** A crisp, sterile base without coldness, utilizing clean surfaces, controlled atmospheric tints, and deliberate white space to ease operational cognitive load.
- **Architectural Precision:** Pixel-exact alignments, micro-borders, and tactile interaction surfaces evoke precision-milled dental instrumentation.
- **Human Centricity:** Softened corner radii, legible rounded humanist typography, and low-stress semantic palettes to temper procedure-associated anxiety.

## Colors
The palette leverages chromatic hygiene to convey trust, clarity, and rapid triage in operational clinical environments.

- **Primary (`#0284C7` / `#0369A1` / `#E0F2FE`):** Directs primary actions, active odonogram selections, patient navigation anchors, and focal visual weight. Tints serve as soft container fills for active tooth states and scheduling blocks.
- **Secondary / Success (`#10B981` / `#ECFDF5`):** Reserved for completed procedures, healthy periodontal diagnostics, balance clearances, and verified records.
- **Tertiary / Warning (`#F59E0B` / `#FFFBEB`):** Denotes pending lab orders, scheduled recalls, patient alerts, and incomplete treatment paths.
- **Error / Critical (`#EF4444` / `#FEF2F2`):** Highlights medical alerts (e.g., systemic allergies, acute pain, bleeding indices).
- **Neutrals (`#0F172A`, `#334155`, `#64748B`, `#94A3B8`, `#E2E8F0`, `#F8FAFC`, `#FFFFFF`):** High-grade slate gradients structure depth, text contrast, hairline compartmentalization, and background planes without stark black/white harshness.

## Typography
Typography is separated into structural display titles (`Plus Jakarta Sans`) and clinical interface text (`Inter`).

- **Plus Jakarta Sans** introduces friendly geometric angles into dashboard headings, patient full names, and analytical overviews, humanizing the diagnostic experience.
- **Inter** ensures uninterrupted data scanning across electronic health records (EHR), tooth numbering (FDI/Universal systems), medication tables, and clinical notes. Tabular figures (`tnum`) must be enforced across all numeric clinical fields, financial balances, and time slots.
- **JetBrains Mono** is utilized strictly for alphanumeric procedure codes (e.g., ADA CDT / TUSS codes) and tooth position coordinates.

## Layout & Spacing
The layout system leverages a fluid, density-aware 12-column grid calibrated for multi-pane workflows (e.g., simultaneous display of 3D Odontogram, clinical history timeline, and treatment plan billing).

- **Desktop (>= 1280px):** 12 columns, 24px gutters, fixed multi-tier navigation (collapsible 72px/240px clinical rail, contextual split-screen layouts for chairside record review).
- **Tablet (768px - 1279px):** 8 columns, 16px gutters, collapsible secondary sidebars with drawer overlays for chairside tablet ergonomics.
- **Mobile (< 768px):** 4 columns, 16px margins, single-stack cards with sticky operational action bars.
- **Spacing Rhythm:** Standard 4px/8px modular base. Compact 8px (`space-sm`) and 12px (`space-md`) paddings are prioritized inside clinical cards to maintain dense data visualization without requiring excessive vertical scrolling.

## Elevation & Depth
Visual hierarchy relies on structural tonal stratification and gossamer drop shadows rather than heavy blurs.

- **Base Layer (Canvas):** Pure off-white neutral `#F8FAFC`.
- **Card/Surface Layer:** Pure `#FFFFFF` enclosed by a hairline boundary: `1px solid #E2E8F0`.
- **Elevation Level 1 (Resting Cards, Odontogram Nodes):** `0px 1px 3px rgba(15, 23, 42, 0.05), 0px 1px 2px rgba(15, 23, 42, 0.03)`.
- **Elevation Level 2 (Hover states, Appointment Chips, Dropdowns):** `0px 4px 12px -2px rgba(2, 132, 199, 0.08), 0px 2px 6px -1px rgba(15, 23, 42, 0.04)`.
- **Elevation Level 3 (Modals, Tooth Diagnostic Drawers, Quick-Entry Sheets):** `0px 16px 32px -8px rgba(15, 23, 42, 0.12), 0px 4px 12px -2px rgba(15, 23, 42, 0.04)`.
- **Active Focus Ring:** `0px 0px 0px 3px rgba(2, 132, 199, 0.18)` applied to interactive tooth roots, input fields, and action buttons.

## Shapes
A balanced `roundedness: 2` geometry maintains an organic yet highly organized impression:
- **Base Components (Inputs, Buttons, Badges):** `rounded-md` (8px) to `rounded-lg` (12px).
- **Panels, Modals, Card Enclosures:** `rounded-xl` (16px) to `rounded-2xl` (24px) for master clinic summary cards, minimizing harsh visual perimeters.
- **Odontogram Anatomical Controls:** Individually rounded facets on anatomical tooth surfaces (vestibular, lingual, occlusal, mesial, distal) utilizing 2px internal inner-curve radii for precise pointer/stylus mapping.
- **Status Avatars & Badges:** Full-pill (`rounded-full`) for clinical tags and patient status indicators.

## Components

### Buttons
- **Primary:** Background `#0284C7`, text `#FFFFFF`, font-weight 600, height 40px (desktop) / 36px (compact chairside). Hover: `#0369A1`. Focus: 3px outer ring `#0284C7` at 20% opacity.
- **Secondary / Soft:** Background `#E0F2FE`, text `#0369A1`, 1px border `#BAE6FD`. Hover: `#BAE6FD`.
- **Neutral Outline:** Background `#FFFFFF`, text `#334155`, 1px border `#E2E8F0`. Hover: `#F8FAFC`, border `#CBD5E1`.
- **Destructive:** Background `#FEE2E2`, text `#B91C1C`, border `#FECACA`.

### Dental Odontogram & Tooth Tiles
- **Tooth Surface Matrix:** Custom segmented vector paths representing adult (11–48) and pediatric (51–85) numbering.
- **Surfaces:** Base `#FFFFFF`, border `#CBD5E1` (1px). Active treatment states:
  - *Caries/Restoration Needed:* Tinted amber/red `#FEE2E2` fill, `#EF4444` border.
  - *Healthy Restored:* `#E0F2FE` fill, `#0284C7` border.
  - *Healthy Untreated:* `#F8FAFC` fill, `#E2E8F0` border.
  - *Endodontic/Canal Indicator:* Centered micro-pin with `#10B981` (sealed) or `#F59E0B` (instrumented).

### Input Fields & Selects
- Height 40px (regular) / 32px (high-density clinical log). Border `1px solid #CBD5E1`, background `#FFFFFF`, text `#0F172A`, placeholder `#94A3B8`.
- Focus: Border `#0284C7`, box-shadow `0px 0px 0px 3px rgba(2, 132, 199, 0.15)`.

### Chips & Clinical Status Pills
- Height 24px, padding 2px 10px, radius 9999px.
- **Scheduled:** `#F8FAFC`, text `#475569`, border `#E2E8F0`.
- **In-Chair / Attending:** `#E0F2FE`, text `#0369A1`, border `#BAE6FD`.
- **Completed:** `#ECFDF5`, text `#047857`, border `#A7F3D0`.
- **Alert / Overdue:** `#FFFBEB`, text `#B45309`, border `#FDE68A`.

### Cards & Medical Record Containers
- Surface: `#FFFFFF`, border `1px solid #E2E8F0`, border-radius 16px (`rounded-xl`).
- Padding: 16px (`space-lg`) for data tables; 20px–24px for overview dashboards.
- Dividers between patient history records: `1px solid #F1F5F9`.

### Checkboxes & Radio Controls
- Checkbox size 18px x 18px, border-radius 6px. Checked state: `#0284C7` with white checkmark icon.
- Radio size 18px x 18px, rounded-full. Selected: 5px solid inner dot `#0284C7` with white padding ring.