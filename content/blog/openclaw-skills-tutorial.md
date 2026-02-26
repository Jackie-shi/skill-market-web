---
title: How to Create and Share OpenClaw Skills: Developer Tutorial
description: Learn how to build OpenClaw agent skills with SKILL.md, scripts, and references. A step-by-step tutorial for publishing skills that other agents can use.
date: 2026-02-22
author: Skill Market Team
category: tutorial
keywords: ['openclaw skills', 'openclaw agent', 'SKILL.md', 'agent skills', 'ai agent development']
relatedSkills: ['openclaw-web-scraper', 'openclaw-github-ops', 'openclaw-deploy-pro']
---

## What Are OpenClaw Skills?

OpenClaw is an AI agent runtime that connects Claude and other LLMs to your devices, APIs, and services. Skills are modular instruction packages that teach OpenClaw agents how to perform specific tasks — from managing GitHub issues to controlling smart home devices.

Every skill is a folder with a `SKILL.md` file and optional scripts, templates, or reference files.

## Skill Anatomy

```
my-skill/
├── SKILL.md          # Instructions for the agent
├── scripts/          # Optional automation scripts
│   └── deploy.sh
├── templates/        # Optional templates
│   └── pr-template.md
└── references/       # Optional reference docs
    └── api-docs.md
```

### SKILL.md Structure

```markdown
# My Skill Name

## Description
One-line description of what this skill does.

## When to Use
- Trigger condition 1
- Trigger condition 2

## Instructions
Step-by-step instructions the agent follows.

## Tools Required
- tool1
- tool2

## Examples
Concrete usage examples.
```

## Building a Skill: GitHub PR Reviewer

Let's build a real skill that reviews pull requests.

### Step 1: Define the Trigger

```markdown
## When to Use
- User asks to review a PR
- User says "review PR #123"
- User pastes a GitHub PR URL
```

### Step 2: Write Instructions

```markdown
## Instructions

1. Fetch the PR diff using `gh pr diff {number}`
2. Read the changed files
3. For each file, check:
   - Code style consistency
   - Potential bugs or edge cases
   - Missing error handling
   - Test coverage
4. Write a structured review comment with:
   - Summary (1-2 sentences)
   - Issues found (categorized by severity)
   - Suggestions for improvement
   - Approval recommendation (approve/request changes)
5. Post the review using `gh pr review {number}`
```

### Step 3: Add Scripts

```bash
#!/bin/bash
# scripts/review-checklist.sh
# Quick automated checks before the AI review

PR_NUM=$1
REPO=${2:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}

echo "=== PR #$PR_NUM Review Checklist ==="

# Check PR size
ADDITIONS=$(gh pr view $PR_NUM --json additions -q .additions)
DELETIONS=$(gh pr view $PR_NUM --json deletions -q .deletions)
echo "Size: +$ADDITIONS/-$DELETIONS"

if [ $ADDITIONS -gt 500 ]; then
  echo "⚠️  Large PR — consider breaking into smaller PRs"
fi

# Check for test files
CHANGED_FILES=$(gh pr diff $PR_NUM --name-only)
HAS_TESTS=$(echo "$CHANGED_FILES" | grep -c "test\|spec")
echo "Test files changed: $HAS_TESTS"

if [ $HAS_TESTS -eq 0 ]; then
  echo "⚠️  No test files modified — verify test coverage"
fi
```

### Step 4: Add Examples

```markdown
## Examples

### Basic PR Review
User: "Review PR #42"
Agent:
1. Runs `gh pr view 42` for context
2. Runs `scripts/review-checklist.sh 42`
3. Reads diff with `gh pr diff 42`
4. Analyzes each changed file
5. Posts structured review

### Review with Focus
User: "Review PR #42, focus on security"
Agent: Same flow but emphasizes:
- Input validation
- SQL injection risks
- Authentication/authorization checks
- Sensitive data exposure
```

## Skill Quality Guidelines

### Do's
- **Be specific** — "Run `gh pr diff`" not "check the diff"
- **Include error handling** — What if the PR doesn't exist?
- **Add examples** — Real input/output pairs
- **Document dependencies** — What tools/CLIs are needed?
- **Keep it focused** — One skill, one job

### Don'ts
- Don't write vague instructions ("do a good review")
- Don't assume tools are installed — check first
- Don't skip error cases
- Don't make skills too broad (a "do everything" skill does nothing well)

## Testing Your Skill

Before publishing, test thoroughly:

1. **Happy path** — Does it work with normal input?
2. **Edge cases** — Empty PR, huge PR, binary files?
3. **Error cases** — Invalid PR number, no permissions?
4. **Different contexts** — Works in different repos?

```bash
# Test with OpenClaw locally
openclaw skill test ./my-skill --input "Review PR #42"
```

## Publishing to Skill Market

Ready to share? Publish on [Skill Market](/publish):

1. Package your skill folder
2. Add metadata (name, description, keywords, platform: "openclaw")
3. Set pricing (free or paid)
4. Submit for review
5. Published!

### Metadata Example

```json
{
  "name": "github-pr-reviewer",
  "displayName": "GitHub PR Reviewer",
  "description": "Automated code review for GitHub pull requests",
  "category": "development",
  "platforms": ["openclaw"],
  "keywords": ["github", "code review", "pull request"]
}
```

## Popular OpenClaw Skills

Get inspired by community skills:

- **[openclaw-web-scraper](/skills/openclaw-web-scraper)** — Intelligent web scraping and data extraction
- **[openclaw-github-ops](/skills/openclaw-github-ops)** — GitHub workflow automation
- **[openclaw-deploy-pro](/skills/openclaw-deploy-pro)** — Deployment pipeline management

[Browse all OpenClaw skills →](/search?q=openclaw)

## Conclusion

OpenClaw skills are the building blocks of AI agent automation. A well-crafted skill turns a general-purpose AI into a domain expert. Start with a simple skill that solves a problem you face daily, test it thoroughly, and share it with the community.

The best skills are born from real needs. What will you build?
