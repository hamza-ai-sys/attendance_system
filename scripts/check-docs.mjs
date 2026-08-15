import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const documentationRoot = join(repositoryRoot, "docs");
const decisionsDirectory = join(repositoryRoot, "docs", "architecture", "decisions");
const ignoredDirectories = new Set([".git", ".next", ".turbo", "coverage", "dist", "node_modules"]);
const errors = [];

function collectMarkdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];

    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectMarkdownFiles(path);
    return entry.isFile() && extname(entry.name) === ".md" ? [path] : [];
  });
}

function display(path) {
  return relative(repositoryRoot, path);
}

function checkLocalLinks(markdownFiles) {
  const linkPattern = /!?\[[^\]]*\]\(([^)]+)\)/g;

  for (const markdownFile of markdownFiles) {
    const source = readFileSync(markdownFile, "utf8");

    for (const match of source.matchAll(linkPattern)) {
      let target = match[1].trim();
      if (target.startsWith("<") && target.includes(">")) {
        target = target.slice(1, target.indexOf(">"));
      } else {
        target = target.split(/\s+["']/u, 1)[0];
      }

      if (!target || target.startsWith("#") || /^[a-z][a-z0-9+.-]*:/iu.test(target)) continue;

      const pathPart = target.split("#", 1)[0];
      let decodedPath;
      try {
        decodedPath = decodeURIComponent(pathPart);
      } catch {
        errors.push(`${display(markdownFile)} has an invalid encoded link: ${target}`);
        continue;
      }

      const resolvedTarget = resolve(dirname(markdownFile), decodedPath);
      if (!existsSync(resolvedTarget)) {
        errors.push(`${display(markdownFile)} links to missing target: ${target}`);
      }
    }
  }
}

function checkDocumentationLayout() {
  const allowedCategories = new Set(["architecture", "deployment", "development", "product"]);

  for (const entry of readdirSync(documentationRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || !allowedCategories.has(entry.name)) {
      errors.push(
        `docs/${entry.name} must be moved into architecture, deployment, development, or product`
      );
    }
  }
}

function checkDecisions() {
  const decisionIndex = readFileSync(join(decisionsDirectory, "README.md"), "utf8");
  const filenames = readdirSync(decisionsDirectory).filter(
    (filename) => filename.endsWith(".md") && filename !== "README.md" && filename !== "template.md"
  );
  const seenNumbers = new Map();
  const requiredSections = ["Status", "Context", "Decision", "Alternatives", "Consequences"];
  const allowedStatuses = new Set(["Proposed", "Accepted", "Deprecated", "Superseded"]);

  for (const filename of filenames) {
    const path = join(decisionsDirectory, filename);
    if (!statSync(path).isFile()) continue;

    const filenameMatch = filename.match(/^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/u);
    if (!filenameMatch) {
      errors.push(`${display(path)} must use NNNN-kebab-case.md`);
      continue;
    }

    const number = filenameMatch[1];
    if (seenNumbers.has(number)) {
      errors.push(
        `${display(path)} duplicates ADR number ${number} used by ${seenNumbers.get(number)}`
      );
    } else {
      seenNumbers.set(number, display(path));
    }

    const source = readFileSync(path, "utf8");
    if (!source.startsWith(`# ADR ${number}: `)) {
      errors.push(`${display(path)} must start with "# ADR ${number}: "`);
    }

    for (const section of requiredSections) {
      if (!new RegExp(`^## ${section}$`, "mu").test(source)) {
        errors.push(`${display(path)} is missing the "## ${section}" section`);
      }
    }

    const status = source
      .match(/^## Status\s+([^\n]+)/mu)?.[1]
      .trim()
      .replace(/[.]$/u, "");
    if (!status || !allowedStatuses.has(status)) {
      errors.push(`${display(path)} has an invalid status: ${status ?? "missing"}`);
    }

    if (!decisionIndex.includes(`(${filename})`)) {
      errors.push(`${display(path)} is not registered in docs/architecture/decisions/README.md`);
    }
  }
}

const markdownFiles = collectMarkdownFiles(repositoryRoot);
checkDocumentationLayout();
checkLocalLinks(markdownFiles);
checkDecisions();

if (errors.length > 0) {
  console.error("Documentation checks failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Documentation checks passed (${markdownFiles.length} Markdown files, ADR structure and index).`
);
