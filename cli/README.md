# skillmarket CLI

> Discover, install, and manage AI Skills from [Skill Market](https://web-black-omega-44.vercel.app)

## Quick Start

```bash
# Search for skills
npx skillmarket search "docker"

# Install a skill (auto-detects your AI tool)
npx skillmarket install docker-compose-generator

# List installed skills
npx skillmarket list

# Get detailed info about a skill
npx skillmarket info docker-compose-generator
```

## Installation

```bash
# Use directly with npx (no install needed)
npx skillmarket install <skill-name>

# Or install globally
npm install -g skillmarket
skillmarket install <skill-name>
```

## Commands

### `skillmarket install <skill-name>`

Downloads and installs a skill from Skill Market. Auto-detects which AI tool you have installed:

| Platform | Install Location |
|----------|-----------------|
| OpenClaw | `~/.agents/skills/<name>/` |
| Claude Code | `~/.claude/skills/<name>/` |
| Cursor | `~/.cursor/skills/<name>/` |
| Windsurf | `~/.windsurf/skills/<name>/` |
| Fallback | `~/.skills/<name>/` |

**Options:**
- `-p, --platform <name>` — Force install for a specific platform
- `-d, --dir <path>` — Custom install directory

### `skillmarket search <query>`

Search for skills on Skill Market.

**Options:**
- `-c, --category <cat>` — Filter by category (development, devops, content, data, design, etc.)
- `-l, --limit <n>` — Max results to show (default: 20)

### `skillmarket list`

List all locally installed skills across all detected platforms.

**Options:**
- `-d, --dir <path>` — Scan a specific directory

### `skillmarket info <skill-name>`

Show detailed information about a skill from the marketplace.

## Platform Detection

The CLI automatically detects which AI tools you have installed by checking for:

- **OpenClaw:** `~/.agents/` directory
- **Claude Code:** `~/.claude/` directory or `claude` binary
- **Cursor:** `~/.cursor/` or `/Applications/Cursor.app`
- **Windsurf:** `~/.windsurf/` or `/Applications/Windsurf.app`

Skills are installed to the first detected platform's skill directory.

## What Gets Installed

Each skill creates a directory with:

```
<skill-name>/
├── skill.json    ← Metadata (name, version, platform, etc.)
├── SKILL.md      ← AI-readable instructions
└── README.md     ← Human-readable documentation
```

## License

MIT
