# OpenCode Commands Reference

Useful opencode commands and settings for later reference.

## Agents & Modes

### `/agent plan`
**Definition:** Switches the active agent to **Plan mode**. In Plan mode, opencode is read-only — it cannot make any file edits or run modifying commands. Instead, it analyzes the codebase and suggests *how* it would implement a feature, so you can review and iterate on the approach before any changes are made.

### `/agent explore`
**Definition:** Switches the active agent to the **explore agent**. This is a fast, specialized agent for quickly searching and mapping out a codebase. It is ideal for questions like *"Find where the database connection is initialized"* or *"Summarize the folder structure and main entry points."*

### `Tab`
**Definition:** Toggles between **Plan mode** and **Build mode** in the TUI. When in Plan mode you'll see an indicator in the lower right corner. Press `Tab` again to return to Build mode, where opencode can make changes.

---

## Subagents

### What are subagents?
**Definition:** Specialized assistants that primary agents (Build/Plan) can spawn for focused tasks. They run in child sessions with their own prompts, models, and permissions.

### Built-in subagents
| Subagent  | Description                                                               |
| --------- | ------------------------------------------------------------------------- |
| `general` | General-purpose agent for complex research and multi-step tasks (can edit) |
| `explore` | Fast read-only agent for searching and mapping out codebases               |
| `scout`   | Read-only agent for external docs and dependency research                  |

### How to use them
- **Manually:** @ mention a subagent in your message, e.g. `@explore find all API route handlers`.
- **Automatically:** Primary agents invoke subagents automatically when a task matches their description.

### Create your own subagent
Create a markdown file in `.opencode/agents/<name>.md` (per-project) or `~/.config/opencode/agents/<name>.md` (global). The filename becomes the agent name:

```markdown
---
description: Reviews code for quality and best practices
mode: subagent
permission:
  edit: deny
  bash: deny
---

You are a code reviewer. Focus on security, performance, and maintainability.
```

Then invoke it with `@review ...`. Alternatively, run `opencode agent create` for a guided setup.

---

## Skills

### What are skills?
**Definition:** Reusable instruction files (a folder containing `SKILL.md`) that opencode discovers and loads on-demand via the native `skill` tool. When your task matches a skill's description, the agent loads the full instructions automatically.

### How to create one
Create a folder per skill with a `SKILL.md` inside. Locations (searched in order):
- `.opencode/skills/<name>/SKILL.md` (project)
- `~/.config/opencode/skills/<name>/SKILL.md` (global)
- `.claude/skills/<name>/SKILL.md` and `~/.claude/skills/<name>/SKILL.md`
- `.agents/skills/<name>/SKILL.md` and `~/.agents/skills/<name>/SKILL.md`

Example — `.opencode/skills/git-release/SKILL.md`:
```markdown
---
name: git-release
description: Create consistent releases and changelogs
---

## What I do
- Draft release notes from merged PRs
- Propose a version bump
```

### Frontmatter requirements
- `name` (required): lowercase alphanumeric with single hyphens, must match the folder name.
- `description` (required, 1–1024 chars): what the skill does AND when to use it.
- Optional: `license`, `compatibility`, `metadata`.

### How to use one
Just describe your task naturally — when it matches a skill's description, opencode loads it automatically. Control access via permissions in `opencode.json`:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "skill": {
      "*": "allow",
      "internal-*": "deny",
      "experimental-*": "ask"
    }
  }
}
```

---

## Context Management

### `/compact` — Context Compaction
**Alias:** `/summarize` · **Keybind:** `c` (TUI default)
**Definition:** Replaces older session context with an LLM-generated summary + a serialized tail of recent context, freeing space in the model's context window. Lossy but safe — it never deletes the durable session messages.

**How it works**
- **Automatic** — ON by default. Before a model call opencode estimates tokens (input + output + cache); if they exceed `context limit − buffer` (~20K token reserve) it compacts automatically.
- **Two steps:** 1) *prune* old tool outputs (keeps the last ~40K tokens, never `skill` outputs, replaces older ones with `[output truncated by compaction]`), 2) *summarize* history via a hidden `compaction` agent into a `summary` message that future turns read instead of the originals.
- **Manual** — type `/compact` or `/summarize` (or the keybind) to force it, even on short histories.
- Watch **"Context X% used"** in the TUI sidebar to see how full the window is.

**Example:** a long session reads a big file, runs 30 tools, then keeps working. Without compaction the old tool outputs would eat the window. When you see the % near the limit, run `/compact`; the model summaries what was done and what's next, and later turns only read that summary instead of every old tool dump.

**Config** (`opencode.json` or global):
```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "compaction": {
    "auto": true,
    "prune": false,
    "keep": { "tokens": 8000 },
    "buffer": 20000
  }
}
```
| Field | Default | Meaning |
| --- | --- | --- |
| `auto` | `true` | Run the preflight size check (doesn't disable manual `/compact`) |
| `prune` | `true` | Prune old tool outputs; `false` keeps them all |
| `keep.tokens` | `8000` | Recent tokens retained beside the summary |
| `buffer` | `20000` | Reserve below the limit; higher = compacts earlier |

**Env overrides:** `OPENCODE_DISABLE_AUTOCOMPACT=true opencode` · `OPENCODE_DISABLE_PRUNE=true`

---

## Other Useful Slash Commands

### `/help`
**Definition:** Shows the help dialog listing available commands and keybinds.

### `/init`
**Definition:** Guided setup that creates or updates `AGENTS.md` for the project. OpenCode analyzes your project and writes the file, which helps it understand project structure and coding patterns. Run this in every new project to generate its `AGENTS.md`.

### `AGENTS.md`
**Definition:** The per-project instruction file (opencode's equivalent of `CLAUDE.md`). Place it in the project root and opencode reads it automatically. Include project description, commands (test/lint/build), and coding conventions.
- Create it automatically with `/init`, or write it manually in the project root.
- Commit it to Git so it stays with the project.
- Point to additional instruction files via the `instructions` field in `opencode.json`:
  ```json
  {
    "$schema": "https://opencode.ai/config.json",
    "instructions": ["AGENTS.md", "docs/style.md"]
  }
  ```
- Docs: https://opencode.ai/docs/rules

### `/models`
**Keybind:** `ctrl+x m`
**Definition:** Lists all available models so you can see options and switch models.

### `/new`
**Alias:** `/clear`
**Definition:** Starts a new session, clearing the current conversation context.

### `/sessions`
**Alias:** `/resume`, `/continue`
**Definition:** Lists and lets you switch between previous sessions.

### `/undo`
**Keybind:** `ctrl+x u`
**Definition:** Undoes the last message — removes the most recent user message, all subsequent responses, and any file changes made. Uses Git internally, so the project must be a Git repository.

### `/redo`
**Keybind:** `ctrl+x r`
**Definition:** Redoes a previously undone message, restoring any file changes. Only available after using `/undo`.

### `/share`
**Definition:** Shares the current session by creating a link and copying it to your clipboard. Conversations are not shared by default.

### `/exit`
**Aliases:** `/quit`, `/q`
**Definition:** Exits opencode.

### `!<command>`
**Definition:** Runs a shell command directly from inside the TUI. The output is added to the conversation as a tool result. Example: `!ls -la`

---

## Key Settings

### `opencode.json`
**Definition:** The main config file controlling server/runtime behavior (model, agents, permissions, compaction, MCP, plugins, etc.).
- Project location: `./opencode.json`
- Global location: `~/.config/opencode/opencode.json`

### `tui.json`
**Definition:** Separate config file controlling TUI appearance and behavior (theme, keybinds, leader timeout, mouse, attention sounds).

### Auto-compaction
**Definition:** opencode automatically compacts the session when the context grows too large. Configure it in `opencode.json`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "compaction": {
    "auto": true,
    "prune": true,
    "keep": { "tokens": 8000 },
    "buffer": 20000
  }
}
```
- `auto` (`true`) — run the preflight size check before each model call.
- `prune` (`true`) — prune old tool outputs (keeps last ~40K tokens, never `skill` outputs).
- `keep.tokens` (`8000`) — approx. tokens of recent context retained beside the summary.
- `buffer` (`20000`) — safety reserve below the context limit; higher = compacts earlier.
- Env overrides: `OPENCODE_DISABLE_AUTOCOMPACT=true opencode` disables auto-compaction · `OPENCODE_DISABLE_PRUNE=true` disables pruning.

### Model context window
**Definition:** To use a model with a larger context window, set the `model` field in `opencode.json`, e.g. `"model": "google/gemini-1.5-pro"`. The model always carries a provider prefix.

---

## MCP Servers (installed but disabled)

All registered globally in `~/.config/opencode/opencode.jsonc` with `enabled: false`.
To activate one, set `"enabled": true` and restart opencode.

| Server | Use it for | Activate |
| --- | --- | --- |
| `context7` | Up-to-date library docs (stops hallucinated APIs) | `context7`: `npx -y @upstash/context7-mcp` |
| `github` | PRs, issues, code search, CI | `github`: `npx -y @github/mcp-server` + PAT |
| `playwright` | Browser automation, screenshots | `playwright`: `npx -y @playwright/mcp` |
| `filesystem` | Scoped local file access | `filesystem`: `npx -y @modelcontextprotocol/server-filesystem` |
| `memory` | Persistent knowledge across sessions | `memory`: `npx -y @modelcontextprotocol/server-memory` |
| `sequential-thinking` | Structured problem-solving | `sequential-thinking`: `npx -y @modelcontextprotocol/server-sequential-thinking` |
| `postgres` | Query a Postgres DB | `postgres`: `npx -y @modelcontextprotocol/server-postgres` + connection string |
| `sqlite` | Query local `.db` files | `sqlite`: `npx -y @modelcontextprotocol/server-sqlite` |
| `brave-search` | Real-time web search | `brave-search`: `npx -y @modelcontextprotocol/server-brave-search` + free-tier key |
| `firecrawl` | Web-to-markdown scraping | `firecrawl`: `npx -y firecrawl-mcp` + free-tier key |

### How to use
- Servers are auto-discovered once enabled — just describe the task (e.g. "open a browser to X" → playwright).
- Keys: set via `environment` in the server config or your shell env, e.g. `GITHUB_PERSONAL_ACCESS_TOKEN`, `BRAVE_API_KEY`, `FIRECRAWL_API_KEY`.
- Verify: run `/mcp` or check `/help` after restart to see which servers are active.

## Hooks (Plugins)

opencode plugins run via hooks. They live in `.opencode/plugins/` (project) or
`~/.config/opencode/plugins/` (global) and are auto-loaded at startup.

### Hook names (opencode vs Claude Code)
| Claude Code | opencode | Runs |
| --- | --- | --- |
| PreToolUse | `tool.execute.before` | Before a tool call |
| PostToolUse | `tool.execute.after` | After a tool completes |
| UserPromptSubmit | `event` (`message.created`) | When you submit a prompt |
| Stop | `event` (`session.idle`) | When a response finishes |
| Notification | `event` (`session.idle` / `tui.toast.show`) | System notifications |

### Hook surfaces
- `event(input)` — every bus event (session, message, tool, permission…)
- `config(cfg)` — once at startup, mutate merged config
- `tool.execute.before` / `tool.execute.after` — around tool calls; `input.tool` = tool name, `output.args` = its arguments. Throw to abort a call.
- `command.execute.before` — before a `/command` runs
- `shell.env` — inject env vars into shell execution
- `permission.ask` — decide allow/deny on permission prompts
- `experimental.*` — chat/session transform hooks

### Events (partial)
`session.created/updated/idle/error`, `message.updated`, `tool.execute.before/after`,
`permission.asked/replied`, `file.edited`, `tui.toast.show`, `session.compacted`

### Example — minimal plugin
```js
export const MyPlugin = async ({ project, client, $ }) => {
  return {
    "tool.execute.before": async (input, output) => {
      if (input.tool === "bash") console.log("running", output.args.command)
    },
  }
}
```

### Global hooks installed in this setup
| Plugin | Hook(s) | Purpose |
| --- | --- | --- |
| `format.js` | `tool.execute.after` | Auto-format files after edits (Prettier) |
| `audit-log.js` | `tool.execute.before/after` | Log all bash commands to `~/.config/opencode/logs/commands.log` |
| `safety.js` | `tool.execute.before` | Block edits/writes to production paths & dangerous bash |
| `notify.js` | `event` (`session.idle`) | Desktop notification when a task finishes |

---

## Notes

- After changing config files, restart opencode for changes to take effect.
- To set Plan mode as the default agent, add `"default_agent": "plan"` to `opencode.json`.
- To explore the codebase, reference files with `@` (e.g. `@src/index.ts`) and ask questions.
- Docs: https://opencode.ai/docs
