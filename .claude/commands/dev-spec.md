# Dev Spec — Developer-Led Implementation Spec

Create a detailed specification document designed for a developer to follow manually — providing full code for boilerplate (types, interfaces, utils, re-exports) while leaving core logic as guided function stubs with edge cases, constraints, and implementation notes.

## Philosophy

This spec format bridges AI assistance and developer ownership:
- **AI handles the tedious parts**: type definitions, interfaces, test boilerplate, file structure, re-exports
- **Developer writes the important parts**: core logic, algorithms, integration code
- **Developer maintains full context**: understands where everything lives, why decisions were made
- **Spec is a living guide**: developer changes and renames freely during implementation

## CRITICAL: No Speculative Code

**Every line of code in a spec must serve an explicit purpose within that spec's scope.**

- Do NOT include types, interfaces, fields, or functions for "future" features
- Do NOT add placeholder fields on interfaces that no function in the spec reads or writes
- Do NOT stub out functions that won't be implemented or tested in this spec
- Do NOT add optional config properties that nothing in the spec uses
- If a type has 10 fields but only 4 are used by this spec's functions and tests, only include the 4

This is the primary source of tech debt in specs — code gets written "for later" and never cleaned up. The scoping questions in Phase 1 and Phase 3 exist specifically to draw a hard boundary around what's in vs out. When in doubt, leave it out. A future spec can add it with full context.

## Mandatory: Use AskUserQuestion Tool

**Always use the `AskUserQuestion` tool when asking the user anything during this process.** Never ask questions via plain text output. Every question in Phase 1 (scope), Phase 3 (edge cases), and Phase 5 (review) MUST go through AskUserQuestion so the user gets a structured prompt they can respond to clearly.

## Process

### Phase 1: Understand the Feature & Draw Scope Boundaries

Use AskUserQuestion to gather context:

```
What feature or system are we speccing out?

Describe:
- What it does
- What packages/areas of the codebase it touches
- Any key constraints or decisions already made
```

After the initial response, use AskUserQuestion again to explicitly define scope:

```
To keep the spec tight, I want to confirm what's IN and OUT of scope:

**I think this spec covers:**
- [Concrete deliverable 1]
- [Concrete deliverable 2]
- [Concrete deliverable 3]

**I think these are OUT of scope (future specs):**
- [Related thing that could creep in]
- [Adjacent feature that touches the same area]

Is this right? Anything to add or move between the lists?
```

This boundary is binding for the rest of the process. Every type, interface, function, and test in the spec must serve something in the "in scope" list. If it only serves an "out of scope" item, it does not go in the spec.

### Phase 2: Explore the Codebase

Before writing anything, thoroughly explore the relevant parts of the codebase:
- Read existing types, interfaces, and patterns in the affected packages
- Understand how similar features are structured
- Identify the existing conventions (naming, file organization, exports, test patterns)
- Note any existing code that will need to be modified vs created fresh

Summarize findings to the user briefly.

### Phase 3: Poke Holes & Surface Edge Cases

This is critical. Before writing the spec, challenge the design:

Use AskUserQuestion to present findings:

```
Before writing the spec, here are potential issues and edge cases I want to flag:

**Design questions:**
1. [Question about an ambiguous requirement]
2. [Question about how X interacts with Y]

**Edge cases to consider:**
- [Edge case 1 — why it matters]
- [Edge case 2 — why it matters]
- [Edge case 3 — why it matters]

**Scope check — things I will NOT include:**
- [Adjacent concern that came up during exploration but is out of scope]
- [Type field / function that only a future feature needs]

**Test coverage suggestions:**
- [Area 1] — because [reason: e.g., "this is the main integration point where bugs will surface"]
- [Area 2] — because [reason]
- [Area 3] — because [reason]

Which of these should we address in the spec vs defer?
```

Iterate on this until the developer is satisfied with the scope and edge case coverage. Use the "Scope check" section to explicitly flag things you considered including but decided are out of scope. This prevents scope creep and gives the developer a chance to pull something back in if they disagree.

### Phase 4: Write the Spec

Create the spec document at the path the user specifies (or suggest one based on existing spec numbering in `agent-os/product/`).

#### Spec Document Structure

```markdown
# {Spec Number} — {Feature Name}

## Overview
[2-3 sentences: what this spec covers and why]

## Prerequisites
[What must be done/exist before starting this spec]

## Directory Structure
[Show the file tree that will exist after implementation, with annotations]

## Implementation Order
[Numbered phases with clear dependencies. Mark which phases are "write the code" vs "just create the file"]

## Types & Interfaces (Full Code)
[Complete, copy-pasteable type definitions with JSDoc comments]

## Function Stubs (Guided)
[For each non-trivial function:]
### `functionName()`
**File:** `path/to/file.ts`
**Signature:**
```ts
export function functionName(params: Type): ReturnType {
  // TODO: implement
  throw new Error("Not implemented");
}
```
**Purpose:** [What this function does]
**Algorithm/Approach:** [High-level steps, not pseudocode — the developer should write the actual logic]
**Edge cases:**
- [Edge case 1 and how to handle it]
- [Edge case 2 and how to handle it]
**Constraints:**
- [Any invariants, performance requirements, or gotchas]

## Utility Functions (Full Code)
[Small pure functions, helpers, validators — provide complete implementations since these are straightforward]

## Re-exports & Index Files (Full Code)
[Complete index.ts files, barrel exports — pure boilerplate]

## Tests
[For each test file:]
### `path/to/thing.test.ts`
```ts
// Full test code with exact expected values
// Tests serve as the executable specification
```

## Configuration & Package Setup (Full Code)
[package.json, tsconfig, tsup config — if creating a new package]

## Integration Points
[How this connects to existing code — what files need modification and what changes]
```

#### What Gets Full Code vs Guided Stubs

**Full code (copy-paste ready):**
- TypeScript types and interfaces **that are used by functions or tests in this spec**
- Utility/helper functions (pure, simple logic) **that are called by this spec's code**
- Re-export index files **for modules created in this spec**
- Package configuration files **for packages created in this spec**
- Test files (these ARE the spec — exact inputs and expected outputs)
- Error classes and constants **that are thrown/used by this spec's functions**

**Guided stubs (developer implements):**
- Core business logic functions
- Integration/orchestration functions
- Functions with complex conditional logic
- Anything where the developer's judgment and context matters

**Never include:**
- Interface fields that no function in this spec reads, writes, or tests
- Types imported but never referenced in any code block
- "Placeholder" stubs for functions that belong in a future spec
- Optional config properties that nothing in this spec consumes
- Re-exports of things that don't exist yet

**Self-check before finalizing:** For every type, interface field, function, and constant in the spec, ask: "What code *in this spec* uses this?" If the answer is nothing, remove it.

For guided stubs, provide:
- The exact function signature with types
- A `throw new Error("Not implemented")` body
- A JSDoc comment summarizing purpose
- Below the code block: algorithm notes, edge cases, constraints

### Phase 5: Review with Developer

After writing the spec, present a summary:

```
Spec created at: [path]

**What you can copy-paste directly:**
- [List of types/interfaces/utils/tests]

**What you'll implement yourself (guided):**
- [List of function stubs with brief descriptions]

**Suggested implementation order:**
1. [Phase 1 — what and why]
2. [Phase 2 — what and why]
...

Review the spec and let me know if anything needs adjustment.
```

## Key Principles

- **Nothing speculative.** Every line of code must be used by something else in this spec. No "future-proofing" fields, no placeholder stubs for the next spec, no types that only a later feature needs. If it's not tested or called in this spec, it doesn't belong here.
- **Tests are the real spec.** Every test file should have exact expected values so the developer knows exactly what correct output looks like.
- **Types before implementation.** All interfaces and types come first — they're the contract. But only include fields that this spec's functions and tests actually use.
- **Edge cases are explicit.** Don't leave the developer guessing. List every edge case you found during Phase 3.
- **No hand-waving.** If a function needs to produce specific output, show what that output looks like in a test. If a type has constraints, document them in JSDoc.
- **Respect the codebase.** Match existing conventions for naming, file organization, and patterns. Don't introduce new conventions without flagging it.
- **Implementation order matters.** Structure the spec so each phase builds on the last. The developer should never have to jump around.
- **Scope is a feature.** A tight spec that covers its scope completely is better than a broad spec that covers everything partially. Defer aggressively to future specs.
