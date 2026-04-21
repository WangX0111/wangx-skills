# visual-explainer

An agent skill for creating interactive HTML animation explainers from complex concepts. It guides the agent through audience discovery, knowledge-gap probing, outline confirmation, and single-file HTML generation.

## Install

After this repository is pushed to GitHub, install it with:

```bash
npx skills add <your-github-username>/<this-repo>@visual-explainer
```

For a global install:

```bash
npx skills add <your-github-username>/<this-repo>@visual-explainer -g -y
```

## Structure

```text
.
├── visual-explainer/
│   ├── SKILL.md
│   └── agents/
│       └── openai.yaml
├── scripts/
│   └── validate-skill.mjs
├── package.json
└── README.md
```

## Development

Validate the skill metadata before publishing:

```bash
npm run check
```

The required publish artifact is `visual-explainer/SKILL.md`. The `agents/openai.yaml` file adds UI-facing metadata for hosts that support it.
