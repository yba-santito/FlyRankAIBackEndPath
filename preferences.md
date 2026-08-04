# OpenCode Preferences

Personal preferences and setup decisions for how opencode behaves with me.
This is a living reference — update it whenever we agree on a new preference.

## Mode handling
- **Always start in Plan mode** (`default_agent: "plan"` in global config).
- **Never change modes** (Plan ↔ Build, or any agent) without my explicit permission.
- If you are in Plan mode, stay there until I explicitly say to switch. Do not switch preemptively, even if a task would be easier in another mode.

## Communication style
- **Examples over abstraction.** Explain in-depth, but always ground with concrete examples (before/after, sample input/output, small illustrative snippets).
- Prefer clear, concrete wording over dense jargon. Pair technical terms with a one-line real-world analogy.
- When proposing changes, show the exact before/after for the files involved.
- When explaining "how X works", walk through a tiny scenario end-to-end, not just the mechanism.

## Tooling & integrations
- **MCP servers**: registered globally in `~/.config/opencode/opencode.jsonc`, all `enabled: false` by default. Flip `enabled: true` only when I ask. Popular set kept: context7, github, playwright, filesystem, memory, sequential-thinking, postgres, sqlite, brave-search, firecrawl.
- **Plugins/hooks**: global plugins live in `~/.config/opencode/plugins/` (format, audit-log, safety, notify are the intended set).
- **Goal mode**: use `opencode-goal-mode` (Claude-style, independent evaluator), reached via the `goal` agent or `/goal` command.

## Conventions
- Global config: `~/.config/opencode/opencode.jsonc`
- Global rules: `~/.config/opencode/AGENTS.md`
- Project commands reference: `opencode-commands.md` (commit-worthy)
- After any config change, restart opencode for it to take effect.
