---
applyTo: "src/components/**/*.tsx"
---

# RiyMo React UI guidance

- Before building UI, inspect the existing component and its callers. Extend the current workflow rather than adding a second competing component or data path.
- Preserve RiyMo's current visual system, responsive layout, Spanish-language labels, and established Tailwind CSS v4 conventions. Reuse shared components such as confirmation dialogs, place/video cards, and existing notification patterns where appropriate.
- Keep components focused and accessible: use semantic controls, explicit labels, keyboard-operable actions, useful loading/empty/error states, and clear disabled/busy states. Avoid `alert()` for routine application feedback when the project already has a notification pattern.
- Keep server-owned state authoritative. For optimistic updates, handle failed requests by restoring or refreshing state; avoid full application reloads for ordinary updates.
- Do not hardcode fabricated catalog content or metrics. Use existing data sources and typed domain models, and show honest empty/unavailable states.
- Do not expose admin-only moderation notes or hidden/unapproved videos to public UI. Reuse the existing API and publication rules.
- Keep changes narrow; do not redesign unrelated screens or alter application functionality beyond the user's authorization.
