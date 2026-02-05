# nomistakes — Skill Brainstorm

> "nomistakes" — the superstition becomes the system.

## Core Concept

Transform the joke incantation into an actual pre-flight checklist that catches the most common failure modes *before* the LLM starts working.

---

## Your Original Ideas

1. **Model + reasoning check** — Is the user on a capable enough model? Is thinking/reasoning enabled?
2. **Plan before coding** — Force a planning step before implementation
3. **Interview for big features** — Generate a "brief" before work begins
4. **Skill inventory check** — Ensure helpful skills are installed
5. **Domain-specific skills** — Prompt for relevant domain skills
6. **Meta: "find skills" skill** — Help users discover what's missing

---

## Research Findings: Where LLMs Actually Fail

From academic research (U of Illinois, Purdue, U of Tokyo) on 558 failed code generations:

### Semantic Errors (logic/understanding)
- **Incorrect conditions** — Most common across all models
- **Missing steps** — Forgetting parts of the logic
- **Wrong logical direction** — Inverting conditions
- **Constant value errors** — Especially in larger models
- **Misunderstanding context** — Not grasping full requirements

### Syntactic Errors (code structure)
- **Missing code blocks** — Incomplete implementations
- **Incorrect function arguments** — Wrong params/types
- **Loop errors** — Off-by-one, infinite loops
- **If-statement errors** — Malformed conditionals

### Key Insight
> Different models fail differently. GPT-4 makes fewer errors but when it fails, it fails *harder* (larger deviation from correct answer). Smaller models produce more "meaningless" code.

---

## Common Prompt Mistakes (from community research)

1. **Too vague** — "Make it better" vs specific criteria
2. **No role assigned** — Generic assistant vs "You are a senior engineer"
3. **No output format** — Unstructured text vs JSON/markdown spec
4. **No examples** — Zero-shot vs few-shot with samples
5. **Overloaded prompts** — Multiple tasks in one vs chained single-purpose
6. **Context amnesia** — Assuming model knows things not in prompt
7. **No delimiters** — Instructions mixed with content vs clear `###` or ``` separators

---

## Proposed Skill Components

### 1. Pre-Flight Checklist (triggered by "nomistakes")
When user appends "nomistakes" to a prompt:

```
Before proceeding, run the nomistakes checklist:

□ Task Clarity
  - Is the request specific enough?
  - Are success criteria defined?
  - Are there ambiguous terms to clarify?

□ Scope Assessment  
  - Is this a small fix, medium feature, or large system?
  - Does this need a brief/spec first?
  - Should I interview for requirements?

□ Model Fit
  - Is this task within my capabilities?
  - Would reasoning/thinking mode help?
  - Flag if task seems beyond current context

□ Context Check
  - Do I have enough context?
  - What files/docs should I read first?
  - Are there domain-specific patterns to follow?

□ Plan First
  - For non-trivial tasks: outline approach before coding
  - Identify edge cases upfront
  - Consider what could go wrong
```

### 2. Brief Generator (for big features)
Interview questions for complex asks:
- What's the end goal?
- Who uses this and how?
- What are the constraints (perf, compatibility, etc)?
- What does success look like?
- What existing patterns should it follow?
- What are the known edge cases?

Output: Structured brief document before any code.

### 3. Skill Recommendations
Check for and suggest:
- **Testing skills** — unit test generation, TDD workflows
- **Linting/formatting** — code style consistency
- **Type checking** — TypeScript, type hints
- **Documentation** — docstring generation
- **Code review** — self-review checklist
- **Domain skills** — React, API design, database, etc.

### 4. Anti-Pattern Detection
Flag common mistake patterns:
- Prompt too vague → ask clarifying questions
- Multiple unrelated tasks → suggest splitting
- Missing examples → request sample input/output
- No success criteria → ask what "done" looks like

### 5. Model Advisory
Gentle suggestions when relevant:
- "This complex refactor might benefit from reasoning mode"
- "For this architectural decision, consider thinking through tradeoffs"
- "This looks like a quick fix — proceeding directly"

---

## Implementation Ideas

### Trigger Mechanisms
- Explicit: user says "nomistakes"
- Implicit: detect large/complex asks and offer to run checklist
- Always-on: lightweight version that catches obvious red flags

### Tone
Keep it light — this started as a joke! The skill should feel like a helpful co-pilot, not a bureaucratic gatekeeper.

```
"nomistakes mode activated 🎯 Let me run through the checklist..."
```

### Progressive Disclosure
- Quick tasks → minimal overhead (just flag obvious issues)
- Medium tasks → suggest planning step
- Large tasks → full interview + brief generation

---

## Skills to Research/Integrate

### Found in Research:

- [x] **Superpowers** (obra/superpowers) — Full TDD + planning methodology, subagent-driven dev
- [x] **planning-with-files** (OthmanAdi) — Persistent task tracking via markdown files
- [x] **ui-ux-pro-max** — Design system generation
- [x] **agent-skills** (Vercel) — React/Next.js best practices
- [x] **context-engineering** — Multi-agent architectures, memory systems

### Skill Directories:
- **VoltAgent/awesome-agent-skills** — 200+ skills, multi-CLI compatible
- **antigravity-awesome-skills** — 600+ skills collection
- **skills.sh** — Public skill directory

### CLI Compatibility:
Skills work across: Claude Code, Codex, Cursor, Gemini CLI, OpenCode, Windsurf, GitHub Copilot

### Positioning:
nomistakes = lightweight pre-flight check
Superpowers = heavyweight full methodology
nomistakes can recommend Superpowers for bigger tasks

---

## Open Questions

1. How aggressive should the checklist be? (Always-on vs opt-in)
2. Should it actually block execution or just advise?
3. How to detect "big feature" vs "quick fix" reliably?
4. Integration with specific CLIs (Cursor, Claude Code, etc.)?
5. Should there be a "nomistakes report" after completion?

---

## Next Steps

1. Decide on core scope for v1
2. Research existing planning/review skills
3. Draft SKILL.md structure
4. Test with real prompts
5. Iterate based on usage

---

*Brainstorm compiled: 2026-02-04*
