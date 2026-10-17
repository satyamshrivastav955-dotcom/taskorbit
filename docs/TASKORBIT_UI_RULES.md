# TaskOrbit — Product design rules

## Current product-quality direction (2026-10-09)

The current product pass supersedes conflicting Phase 0 restrictions below:
Inter/system sans-serif typography, Lucide icons, deep navy navigation, white cards,
crisp blue-grey borders, and fast purposeful motion with reduced-motion support.
All four roles share the blue palette in `frontend/src/styles/theme.css`.
Use semantic tokens for component colors; green, amber, and red communicate
success, warning, and error rather than role identity or decorative branding.
Filled buttons use professional blue (#245B91) for 7.05:1 white-text contrast;
action blue (#367FC4) is used for focus rings, chart marks, and non-text accents.
No gradients, glow, glassmorphism, floating-loop animations, or oversized cards.
Overview screens prioritize actionable queues, project delivery, and activity;
no fabricated sparklines, arbitrary workload percentages, or decorative charts.
Every visible section must be connected to real application records, and every
control must have a meaningful outcome. Test fixtures live outside the product
entry points. Mobile navigation, keyboard operation, dialog focus, and loading,
empty, error, and success feedback are part of the visual quality standard.

The earlier phase rules below are retained for design history and any guidance
that does not conflict with this current direction.

Target feel: Linear / Jira / GitHub / Stripe Dashboard. Quiet, dense, functional
work tool. Not a landing page, not a template. Approved in Phase 1 via `/ui-preview`
before any page exists.

## Hard bans

- No gradients, glassmorphism, blur, glow, neon.
- No emoji in the UI. lucide-react only, 16px or 18px, stroke 1.75.
- No hero banners, decorative blobs, stock illustrations.
- No `Welcome back, <name>` greetings. Plain page titles like `Overview`.
- No purple/indigo primary. No rainbow stat cards.
  (APPROVED OVERRIDE — auth + shared system screens only: `--indigo-700/600/500/100`
  for primary actions, active nav, focus and progress accents, per the approved
  reference images. Role feature pages keep the original palette.)
- No big shadows. Cards are flat: white, 1px border, 8px radius.
  A 1-2px subtle shadow only on popovers and modals.
- No hover animations that move or scale. Only 120ms background-color transitions.
- No centered-everything layouts. Left-aligned, information dense.
- No placeholder data like Lorem ipsum, John Doe, Acme Corp. Use realistic
  Indian software/design agency data: clients `Kulkarni Textiles`,
  `Brightline Logistics`; people `Rahul Deshmukh`, `Priya Nair`, `Amit Joshi`;
  tasks like `Draft onboarding flow wireframes`, `Set up staging environment`.
- Tables over cards for tabular data. Cards only for discrete objects (a project).
- Empty states: one line of text plus one action. No illustration.
- Numbers, dates and statuses are the visual focus.

## Current palette (`frontend/src/styles/theme.css` is the source of truth)

```css
--deep-navy: #163B65;
--professional-blue: #245B91;
--action-blue: #367FC4;
--pale-blue: #EAF2FA;
--app-background: #F5F8FC;
--surface-white: #FFFFFF;
--text-strong: #243449;
--border-blue: #DFE7F0;
```

- Existing color aliases resolve to this system for feature-page compatibility.
- `--chart-1` through `--chart-6` provide blue series colors with readable labels.
- Color only carries meaning (status, conflict, primary action).
- UI is ~90% white, grey-blue and navy.

## Typography (Inter only)

| use          | size / weight |
| ------------ | ------------- |
| page title   | 22 / 600      |
| section title| 16 / 600      |
| card title   | 14 / 600      |
| body         | 14 / 400      |
| table        | 13 / 400      |
| caption      | 12 / 400      |
| button       | 13 / 500      |

Line-height 1.5. Only all-caps use: 11px table column headers in `--text-muted`.

## Spacing scale only

`4, 8, 12, 16, 20, 24, 32, 40, 48`. No other values.

## Layout

- Sidebar 232px, `--navy-900`, white 13px labels with 16px Lucide icons,
  active item: 3px left border `--cyan-500` + slightly lighter navy.
  Top: `TaskOrbit` 15px/600 plain text with a 20px square CSS logo mark.
- Top bar 52px, white, 1px bottom border. Left: breadcrumb.
  Right: notification bell with count badge, then 28px initials circle
  with name and role.
- Content: max-width 1200px, padding 24px, background `--bg`.
  Usable down to 1024px, nothing overflows horizontally.

## StatusBadge (one reusable component)

12px text, 4px radius, tinted background with darker same-hue text, no border.

| status      | colour  |
| ----------- | ------- |
| todo        | grey    |
| in_progress | teal    |
| submitted   | blue    |
| in_review   | darker blue |
| revision    | amber   |
| approved    | green   |
| conflict    | red     |

Project statuses (`draft`, `submitted`, `active`, `completed`) reuse the same
badge shape in neutral/blue/green tones; exact mapping is locked in Phase 1 preview.

## Components

- Button: 13/500, 8px radius, primary `--blue-600`, hover `--blue-700`,
  disabled while pending. No `alert()`.
- Card: white, 1px `--border`, 8px radius, no shadow.
- Input / Select / TextArea: white, 1px `--border`, 8px radius,
  inline validation message under the field.
- Table: 13px rows, 11px uppercase muted headers, 1px row dividers, left-aligned.
- Modal / Popover: only place a 1-2px shadow is allowed.
- Skeleton/Loader: thin skeleton or inline text, no big spinners.
- EmptyState: one line + one action. ErrorState: message + retry.
- FileUpload: plain input with file name + size, no drag-and-drop art.

## Icons

lucide-react only, 16px or 18px, stroke 1.75. No emoji. No icon libraries mixed in.

## Naming

Human naming: `useTaskList`, `formatDateRange`, `TaskTable`.
Never `Enhanced`, `Advanced`, `Ultimate`. Files under ~250 lines,
small single-purpose components. No dead code, no commented-out blocks.

## Verification

`npm run build` performs TypeScript checking and the production Vite build.
`npm run test:ui` covers role workflows, modal keyboard interaction, rendered
text contrast, reduced motion, and responsive layouts from 320px to 1440px.
Visual-check screenshots are generated in `test-results/`.

## JSP and Laravel pages

Same rules: Inter, flat white cards, 1px `#DFE7F0` border, 8px radius,
navy headings, blue links/buttons, `#F5F8FC` background, no Bootstrap,
one plain stylesheet per module, print stylesheet for reports.
