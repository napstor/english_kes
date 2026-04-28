import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const rulesPath = path.join(root, "content/editorial/rules.json");
const reportPath = path.join(root, "content/editorial-report.md");
const maxExamplesPerRule = 12;

const config = JSON.parse(readFileSync(rulesPath, "utf8"));

function lineStarts(text) {
  const starts = [0];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === "\n") starts.push(index + 1);
  }
  return starts;
}

function lineNumber(starts, offset) {
  let low = 0;
  let high = starts.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (starts[mid] <= offset) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return Math.max(1, high + 1);
}

function excerpt(text, offset, length) {
  const before = text.lastIndexOf("\n", offset);
  const after = text.indexOf("\n", offset + length);
  return text
    .slice(before === -1 ? Math.max(0, offset - 80) : before + 1, after === -1 ? offset + length + 80 : after)
    .trim()
    .replace(/\s+/g, " ");
}

function scanTarget(target, rules) {
  const absolutePath = path.join(root, target.path);
  const text = readFileSync(absolutePath, "utf8");
  const starts = lineStarts(text);
  const matches = [];

  for (const rule of rules) {
    if (!rule.scope.includes(target.kind)) continue;

    const regex = new RegExp(rule.pattern, "giu");
    let match;
    let count = 0;
    const examples = [];

    while ((match = regex.exec(text))) {
      count += 1;
      if (examples.length < maxExamplesPerRule) {
        examples.push({
          line: lineNumber(starts, match.index),
          match: match[0],
          excerpt: excerpt(text, match.index, match[0].length)
        });
      }

      if (match.index === regex.lastIndex) regex.lastIndex += 1;
    }

    if (count > 0) {
      matches.push({
        rule,
        count,
        examples
      });
    }
  }

  const totals = {
    block: 0,
    warn: 0,
    info: 0
  };

  for (const match of matches) {
    totals[match.rule.severity] += match.count;
  }

  return {
    target,
    matches,
    totals
  };
}

const targetReports = config.targets.map((target) => scanTarget(target, config.rules));
const totals = {
  block: 0,
  warn: 0,
  info: 0
};

for (const targetReport of targetReports) {
  for (const match of targetReport.matches) {
    totals[match.rule.severity] += match.count;
  }
}

const lines = [
  "# Editorial Report",
  "",
  `Generated from \`content/editorial/rules.json\`.`,
  "",
  "## Summary",
  "",
  `- Block findings: ${totals.block}`,
  `- Warnings: ${totals.warn}`,
  `- Info notes: ${totals.info}`,
  "",
  "| Target | Block | Warn | Info |",
  "| --- | ---: | ---: | ---: |",
  ...targetReports.map((targetReport) => {
    return `| ${targetReport.target.id} | ${targetReport.totals.block} | ${targetReport.totals.warn} | ${targetReport.totals.info} |`;
  }),
  "",
  "Block findings in `content/source/...` mean the source contains risky material. Block findings in `lib/...` mean application course data needs correction before release.",
  ""
];

for (const targetReport of targetReports) {
  lines.push("## " + targetReport.target.id);
  lines.push("");
  lines.push(`File: \`${targetReport.target.path}\``);
  lines.push("");

  if (!targetReport.matches.length) {
    lines.push("No findings.");
    lines.push("");
    continue;
  }

  for (const match of targetReport.matches) {
    lines.push(`### ${match.rule.severity.toUpperCase()} ${match.rule.id}`);
    lines.push("");
    lines.push(`- Count: ${match.count}`);
    lines.push(`- Recommendation: ${match.rule.recommendation}`);
    lines.push("");
    lines.push("| Line | Match | Context |");
    lines.push("| ---: | --- | --- |");
    for (const example of match.examples) {
      const safeMatch = String(example.match).replace(/\|/g, "\\|");
      const safeExcerpt = example.excerpt.replace(/\|/g, "\\|");
      lines.push(`| ${example.line} | \`${safeMatch}\` | ${safeExcerpt} |`);
    }
    if (match.count > match.examples.length) {
      lines.push(`| ... | ... | ${match.count - match.examples.length} more occurrence(s) omitted |`);
    }
    lines.push("");
  }
}

writeFileSync(reportPath, lines.join("\n"), "utf8");

console.log(`Editorial report written to ${path.relative(root, reportPath)}`);
console.log(`Block=${totals.block} Warn=${totals.warn} Info=${totals.info}`);
