# Agent-OS Workflow Guidelines

This document contains important guidelines for agents working with the Agent-OS spec workflow.

## Spec-Researcher Agent Guidelines

### Using AskUserQuestion Tool

When the spec-researcher agent generates clarifying questions for the user, the orchestrating agent MUST use the `AskUserQuestion` tool instead of displaying questions as plain text.

**❌ DON'T DO THIS:**
```
Show questions as text and wait for user to respond in chat
```

**✅ DO THIS:**
```
Use AskUserQuestion tool to present questions with structured options
```

### Benefits of Using AskUserQuestion:
1. **Structured responses**: Users select from predefined options instead of free-form text
2. **Faster workflow**: No back-and-forth clarification needed
3. **Better UX**: Visual selection interface instead of typing answers
4. **Type-safe**: Responses are structured data, not text to parse

### Example Usage:

When spec-researcher provides questions like:
- "Should we use X or Y?"
- "What version should we publish?"
- "Should this be the default?"

Transform them into AskUserQuestion calls:

```typescript
AskUserQuestion({
  questions: [
    {
      question: "Should we use X or Y?",
      header: "Choice",
      multiSelect: false,
      options: [
        {
          label: "Option X (Recommended)",
          description: "Description of what X does"
        },
        {
          label: "Option Y",
          description: "Description of what Y does"
        }
      ]
    }
  ]
})
```

### Guidelines:
- Always include a `header` (short, 1-2 word label)
- Provide 2-4 options per question
- Mark recommended options with "(Recommended)" suffix
- Write clear descriptions explaining implications
- Use multiSelect: false for single-choice (most common)
- Use multiSelect: true for checkboxes (e.g., "Select all that apply")

## Spec-Writer Agent Guidelines

(To be documented)

## Task-List-Creator Agent Guidelines

(To be documented)

## Implementer Agent Guidelines

(To be documented)

## Implementation-Verifier Agent Guidelines

(To be documented)

---

## General Workflow Notes

### Spec Creation Process
1. **Shape Spec** (`/shape-spec`) - Initialize and gather requirements
2. **Write Spec** (`/write-spec`) - Create detailed specification
3. **Create Tasks** (`/create-tasks`) - Break down into actionable tasks
4. **Implement Tasks** (`/implement-tasks`) - Execute implementation
5. **Verify Implementation** - Validate completion

### Best Practices
- Always use the appropriate tool for the job (AskUserQuestion for questions)
- Keep user interactions efficient and structured
- Provide clear, actionable options
- Mark recommended choices explicitly
- Include descriptions that explain trade-offs
