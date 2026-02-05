---
name: nomistakes
description: Pre-flight checklist to reduce LLM coding errors. Trigger by appending "nomistakes" to any prompt. Catches common failure modes before work begins: vague requirements, missing context, scope creep, wrong model choice. Recommends planning workflows for complex tasks. Light enough for quick fixes, thorough enough for big features.
---

# nomistakes

A lightweight pre-flight checklist that catches common LLM coding errors before they happen.

## Trigger

Activate when the user appends **"nomistakes"** to their prompt.

## Quick Check (< 30 seconds)

Run through this mental checklist silently. Only surface issues if found:

### 1. Clarity Check
- Is the request specific enough to act on?
- Are there ambiguous terms that could mean multiple things?
- Are success criteria clear?

**If unclear:** Ask 1-2 targeted clarifying questions before proceeding.

### 2. Scope Assessment
Categorize the task:
- **Quick fix** (< 5 min): typo, small bug, simple refactor → proceed directly
- **Medium task** (5-30 min): new function, component, feature addition → brief planning
- **Large task** (> 30 min): new system, major refactor, multi-file changes → recommend full planning

**If large:** Suggest using a planning workflow or the `superpowers` skill.

### 3. Context Check
- Do I have enough context to do this well?
- What files should I read first?
- Are there existing patterns in the codebase I should follow?

**If missing context:** State what you need before starting.

### 4. Complexity Flag
For tasks that would benefit from reasoning/thinking mode:
- Architectural decisions
- Complex algorithms
- Security-sensitive code
- Multi-step refactors

**If complex:** Mention that extended thinking might help (if available).

## Response Format

If all checks pass, proceed normally with a brief acknowledgment:

```
✓ nomistakes check passed. [brief task summary]
```

If issues found, surface them concisely:

```
nomistakes flagged:
• [issue 1]
• [issue 2]

[question or suggestion to resolve]
```

## For Larger Tasks

When scope assessment indicates a large task, recommend:

1. **Create a brief first** — Interview for requirements:
   - What's the end goal?
   - Who uses this and how?
   - What constraints exist?
   - What does success look like?
   - What patterns should it follow?

2. **Write a plan** — Before coding:
   - Break into small, testable steps
   - Identify dependencies
   - Note potential edge cases

3. **Consider specialized skills:**
   - `superpowers` — Full TDD + planning workflow
   - `planning-with-files` — Persistent task tracking
   - Domain-specific skills for the tech stack

## Anti-Patterns to Flag

Catch these common prompt mistakes:

| Pattern | Flag |
|---------|------|
| "Make it better" | Ask: better how? Faster? Cleaner? More readable? |
| "Fix the bug" (no details) | Ask: what's the expected vs actual behavior? |
| Multiple unrelated tasks | Suggest splitting into separate requests |
| "Rewrite everything" | Confirm scope, suggest incremental approach |
| No examples provided | Request sample input/output for clarity |

## Tone

Keep it light — this started as a joke! Be helpful, not bureaucratic:

```
✓ nomistakes: looks clear, let's go.
```

Not:

```
NOMISTAKES PROTOCOL INITIATED. RUNNING 47-POINT VERIFICATION CHECKLIST...
```

## What This Skill Is NOT

- Not a full development methodology (use `superpowers` for that)
- Not a replacement for code review
- Not always-on (only triggers with explicit "nomistakes")
- Not a guarantee (just reduces common errors)

---

*"nomistakes" — the superstition that became a system.*
