# wangx-skills

Personal agent skills.

## Skills

- `visual-explainer`: create interactive HTML animation explainers from complex concepts.
- `ultimate-wechat-official-account-pipeline`: run a full WeChat Official Account content pipeline for writing, rewriting, illustration, formatting, and publishing workflows.

## Install

Install a skill from this repository with:

```bash
npx skills add WangX0111/wangx-skills@visual-explainer
npx skills add WangX0111/wangx-skills@ultimate-wechat-official-account-pipeline
```

For a global install:

```bash
npx skills add WangX0111/wangx-skills@visual-explainer -g -y
npx skills add WangX0111/wangx-skills@ultimate-wechat-official-account-pipeline -g -y
```

## Structure

```text
.
├── visual-explainer/
│   └── SKILL.md
├── ultimate-wechat-official-account-pipeline/
│   ├── SKILL.md
│   ├── config/
│   ├── feedback/
│   ├── knowledge/
│   └── references/
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
