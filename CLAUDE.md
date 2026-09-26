# CivicPulse — Claude Code Instructions

## Project goal

CivicPulse is a hackathon MVP/showcase.

Optimize for:
- Working functionality
- Fast iteration
- Faithful implementation of the approved design
- Reliable demo flows
- Simple architecture
- Low token/tool usage

Do NOT optimize for production-scale architecture.

---

## Source of truth

The design files are the visual and interaction source of truth:
- `CivicPulse Citizen.dc.html` — citizen-facing screens
- `CivicPulse Government.dc.html` — government-facing screens

Before changing any designed screen:
- Inspect the corresponding design file
- Understand its existing behavior
- Preserve its visual language and interaction patterns

Do not redesign unless explicitly requested.

---

## No assumptions

Never guess when the answer can be obtained by inspecting:
- Existing code
- Design files
- Package configuration
- Project configuration
- Existing components
- Existing data/state

When uncertain about an important implementation decision:
- Inspect first
- Identify the ambiguity
- Ask when necessary

Do not silently invent architecture or behavior.

---

## Avoid over-engineering

Prefer the simplest implementation that satisfies the current MVP requirement.

Do not introduce unnecessary:
- Abstractions
- Services
- Layers
- Design systems
- State-management libraries
- Dependencies
- APIs
- Databases
- Infrastructure
- Documentation
- Tests
- Refactors

Do not refactor unrelated code. Do not "improve" working code unless it directly helps the current task.

---

## Development workflow

For every meaningful feature, bug fix or architectural change:

**PLAN → WAIT → IMPLEMENT → VERIFY → TARGETED TEST → REPORT → STOP**

**PLAN:** Inspect relevant code, identify affected files/components, identify assumptions/risks, create a short plan.

**WAIT:** Do not implement until approved.

**IMPLEMENT:** Implement only the approved scope. Reuse existing patterns. Keep the change focused.

**VERIFY:** Inspect the resulting implementation. Run the application when appropriate. Use browser verification for UI changes when useful.

**TEST:** Run only tests/checks relevant to the change. Do not generate tests for trivial details. Do not run exhaustive test suites without a specific reason.

**REPORT:**
- What changed
- What was verified
- Relevant checks/tests
- Remaining issue, if any

Then **STOP**. Do not automatically continue to another feature.

---

## Tooling

### Ponytail
Available as a Claude Code plugin. Use to minimize unnecessary code, avoid over-engineering, and keep implementation focused. Do NOT reinstall or duplicate it.

### gstack
Available via skills. Use selectively:
- Planning/review for substantial architectural changes
- Code review for meaningful feature groups
- Browser QA for important showcase flows

Do NOT run every skill automatically. Do NOT create multi-agent workflows by default.

### Graphify
Not currently installed. Do not install unless explicitly requested.

### Frontend design
Use the `frontend-design` skill when implementing or refining UI. The CivicPulse design files are the source of truth — do not redesign into another style.

### Browser verification
Use `browse` / `connect-chrome` skills for verifying important user flows. Prefer targeted verification over exhaustive browser testing.

### Memory
Use project memory for important information only:
- Architectural decisions
- Important implementation decisions
- Completed phases
- Important constraints
- Unresolved decisions

Do NOT save: command noise, grep output, routine debugging, small implementation details.

---

## Git discipline

Commits represent completed units of work — not every file change.

A commit should represent one meaningful: feature, bug fix, refactor, configuration change, or completed implementation task.

**Good:** `feat: add civic issue discovery`, `fix: preserve issue state across tabs`

**Bad:** commit after changing one component, commit after every file, commit after every small styling adjustment, commit intermediate broken states

Before committing: inspect git diff, ensure unrelated changes are not included, verify the feature/fix is in a coherent state.

---

## Dependency discipline

Before adding a dependency:
- Check whether the project already has an equivalent capability
- Check whether a simple local implementation is sufficient

Do not add dependencies for convenience alone.

---

## Design discipline

Do not replace existing design with:
- Generic SaaS UI
- Generic government portal UI
- Default component-library styling
- Unnecessary gradients or glassmorphism
- Generic cards
- Unrelated design systems

Preserve the approved CivicPulse design.

---

## Verification philosophy

Verification should protect the MVP, not become the MVP.

Prioritize:
- Important user flows
- Changed functionality
- Integration points
- Production build before deployment
- Critical showcase paths

Avoid: exhaustive testing, unnecessary test generation, repetitive reports, testing implementation details that cannot realistically break the demo.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
