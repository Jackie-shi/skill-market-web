---
title: How to Build Claude Code Skills: From Zero to Published
description: A complete guide to creating, testing, and publishing Claude Code skills. Learn the CLAUDE.md format, best practices, and how to share your skills with the community.
date: 2026-02-25
author: Skill Market Team
category: tutorial
keywords: ['claude code', 'claude code skills', 'CLAUDE.md', 'anthropic claude', 'ai skills development']
relatedSkills: ['claude-fullstack-dev', 'claude-code-reviewer', 'claude-api-builder']
---

## What Are Claude Code Skills?

Claude Code skills are structured instruction sets that customize how Claude Code (Anthropic's CLI coding agent) behaves in your projects. They live in `CLAUDE.md` files and define everything from coding style to architectural decisions.

Unlike simple prompts, skills are **reusable**, **shareable**, and **composable** — you can stack multiple skills for different aspects of your workflow.

## The CLAUDE.md Format

Every Claude Code skill starts with a `CLAUDE.md` file. Here's the anatomy:

```markdown
# Skill Name

## Role
You are [specific expert role]...

## Rules
- Rule 1
- Rule 2

## Patterns
[Code patterns and examples]

## Context
[Project-specific information]
```

Claude Code reads this file at the start of every session, treating it as authoritative instructions for your project.

## Building Your First Skill

### Step 1: Define the Problem

What repetitive instruction do you give Claude Code? That's your skill. Examples:

- "Always use the repository pattern for database access"
- "Follow our component naming convention"
- "Generate tests alongside every new function"

### Step 2: Write Clear Instructions

Claude Code responds best to direct, specific instructions:

```markdown
# TypeScript API Builder

## Role
You are a TypeScript API specialist. You build type-safe, well-documented REST APIs.

## Architecture Rules
- Every endpoint has a Zod schema for input validation
- Use the service layer pattern: Route → Service → Repository
- Return typed responses using the ApiResponse<T> wrapper
- Handle errors at the service level, not in routes

## Code Generation Rules
- Generate the schema, service, and route together
- Include JSDoc with @example for every public function
- Add integration tests in a colocated .test.ts file
- Use barrel exports (index.ts) per feature directory
```

### Step 3: Add Concrete Examples

Examples are worth a thousand words of instruction:

```markdown
## Example: Creating a New Endpoint

When asked to create a new API endpoint, generate this structure:

```
src/features/users/
├── users.schema.ts    # Zod schemas
├── users.service.ts   # Business logic
├── users.route.ts     # Express/Hono route
├── users.test.ts      # Integration tests
└── index.ts           # Barrel export
```

Schema pattern:
\`\`\`typescript
import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
\`\`\`
```

### Step 4: Define Boundaries

Tell Claude what NOT to do:

```markdown
## Constraints
- NEVER use `any` type — use `unknown` and narrow
- NEVER skip validation on user input
- NEVER commit secrets or env vars in code examples
- DO NOT generate mock data inline — use factory functions
```

## Advanced Skill Techniques

### Composable Skills

You can create skills that work together:

```markdown
# Base: TypeScript Strict

## Applies To
All TypeScript files in this project.

## Rules
- strict mode enabled
- no implicit any
- explicit return types on exported functions
```

Then a specialized skill builds on it:

```markdown
# Extension: React Components

## Extends
TypeScript Strict (base skill)

## Additional Rules
- Functional components only
- Props defined as interfaces (not types)
- Use React.FC sparingly — prefer explicit props
```

### Context-Aware Skills

Skills can include project-specific knowledge:

```markdown
## Database Schema Context
Our database has these key tables:
- users (id, email, name, role)
- skills (id, name, author_id, status)
- purchases (id, user_id, skill_id, amount)

Always reference this schema when generating queries.
Foreign keys follow the convention: {table_singular}_id
```

### Testing-Integrated Skills

```markdown
## Testing Requirements
Every new function must have tests. Follow this pattern:

1. Happy path test
2. Edge case test (empty input, null, boundary values)
3. Error case test (invalid input, network failure)

Test naming: `describe("{FunctionName}") > it("should {expected behavior}")`
```

## Publishing Your Skill

Once your skill is polished, share it with the community on [Skill Market](/publish):

1. **Package it** — Include CLAUDE.md + README + metadata
2. **Add keywords** — Help others find it (e.g., "typescript", "api", "testing")
3. **Set pricing** — Free or paid (Skill Market handles payments)
4. **Publish** — One click and it's live

### Quality Checklist Before Publishing

- [ ] Clear, specific instructions (not vague platitudes)
- [ ] At least 2 concrete code examples
- [ ] Explicit constraints (what NOT to do)
- [ ] Tested with real projects (not just theory)
- [ ] Good README explaining use cases

## Discovering Great Skills

Don't start from scratch. Browse community skills on Skill Market:

- **[claude-fullstack-dev](/skills/claude-fullstack-dev)** — Full-stack development with Claude Code
- **[claude-code-reviewer](/skills/claude-code-reviewer)** — Automated code review skill
- **[claude-api-builder](/skills/claude-api-builder)** — API-first development patterns

## Best Practices Summary

| Do | Don't |
|-----|-------|
| Be specific and concrete | Use vague instructions ("write good code") |
| Include code examples | Assume Claude knows your conventions |
| Define boundaries clearly | Leave ambiguity in critical patterns |
| Test with real projects | Publish untested skills |
| Keep it focused (one concern) | Cram everything into one skill |
| Update as your stack evolves | Set and forget |

## Conclusion

Claude Code skills are the most underutilized productivity multiplier in AI-assisted development. A 30-minute investment in writing a good skill saves hours of repeated instructions over weeks and months.

Start building your skill today, or [explore what the community has built](/search?q=claude+code) on Skill Market.
