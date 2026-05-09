import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const skillDirs = process.argv.slice(2);
const ignoredTopLevelDirs = new Set([".git", ".github", ".agents", ".codex", "node_modules", "scripts"]);
const targets = skillDirs.length > 0
  ? skillDirs
  : readdirSync(".", { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !ignoredTopLevelDirs.has(name))
    .filter((name) => existsSync(join(name, "SKILL.md")));

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

function parseFrontmatter(content, skillDir) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    fail(`${skillDir}/SKILL.md is missing YAML frontmatter`);
    return null;
  }

  const fields = {};
  const lines = match[1].split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const field = line.match(/^([a-zA-Z0-9_-]+):(?:\s*(.*))?$/);
    if (!field) {
      continue;
    }

    const [, key, rawValue = ""] = field;
    if (rawValue === "|") {
      const block = [];
      for (index += 1; index < lines.length; index += 1) {
        const blockLine = lines[index];
        if (!blockLine.startsWith("  ") && blockLine.trim() !== "") {
          index -= 1;
          break;
        }
        block.push(blockLine.replace(/^  ?/, ""));
      }
      fields[key] = block.join("\n").trim();
    } else {
      fields[key] = rawValue.replace(/^["']|["']$/g, "").trim();
    }
  }

  return fields;
}

for (const skillDir of targets) {
  const skillPath = join(skillDir, "SKILL.md");

  try {
    if (!statSync(skillPath).isFile()) {
      fail(`${skillPath} is not a file`);
      continue;
    }
  } catch {
    fail(`${skillPath} does not exist`);
    continue;
  }

  const content = readFileSync(skillPath, "utf8");
  const frontmatter = parseFrontmatter(content, skillDir);
  if (!frontmatter) {
    continue;
  }

  if (!frontmatter.name) {
    fail(`${skillPath} is missing frontmatter name`);
  } else if (!/^[a-z0-9-]+$/.test(frontmatter.name)) {
    fail(`${skillPath} name must use lowercase letters, digits, and hyphens`);
  }

  if (!frontmatter.description) {
    fail(`${skillPath} is missing frontmatter description`);
  } else if (frontmatter.description.length > 1024) {
    fail(`${skillPath} description is ${frontmatter.description.length} chars; keep it at or below 1024`);
  }

  const openaiYaml = join(skillDir, "agents", "openai.yaml");
  if (existsSync(openaiYaml) && !statSync(openaiYaml).isFile()) {
    fail(`${openaiYaml} is not a file`);
  }
}

if (!process.exitCode) {
  console.log(`Validated ${targets.length} skill${targets.length === 1 ? "" : "s"}.`);
}
