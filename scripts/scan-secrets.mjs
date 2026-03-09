import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const IGNORE_DIRS = new Set([".git", "node_modules", ".next", "dist", "coverage"]);
const IGNORE_FILES = new Set([".env.example", "package-lock.json"]);

const PATTERNS = [
  { name: "supabase secret key", regex: /\bsb_secret_[A-Za-z0-9_-]{20,}\b/g },
  {
    name: "supabase service role env assignment",
    regex: /SUPABASE_SERVICE_ROLE_KEY\s*=\s*([^\s`"']+)/g
  },
  {
    name: "admin api key env assignment",
    regex: /ADMIN_API_KEY\s*=\s*([^\s`"']+)/g
  },
  { name: "jwt-like token", regex: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+\b/g }
];

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) {
        continue;
      }
      walk(full, acc);
    } else if (entry.isFile()) {
      if (IGNORE_FILES.has(entry.name)) {
        continue;
      }
      acc.push({ full, rel });
    }
  }
  return acc;
}

function isBinary(buffer) {
  const max = Math.min(buffer.length, 8000);
  for (let i = 0; i < max; i += 1) {
    if (buffer[i] === 0) {
      return true;
    }
  }
  return false;
}

const files = walk(ROOT);
const findings = [];

for (const file of files) {
  const data = fs.readFileSync(file.full);
  if (isBinary(data)) {
    continue;
  }
  const text = data.toString("utf8");
  for (const pattern of PATTERNS) {
    const matches = text.match(pattern.regex);
    if (!matches) {
      continue;
    }
    for (const match of matches) {
      const trimmed = match.trim();
      if (
        trimmed.endsWith("=") ||
        trimmed.endsWith("=<value>") ||
        trimmed.includes("NEXT_PUBLIC_SUPABASE_URL=") ||
        trimmed.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY=")
      ) {
        continue;
      }
      findings.push({
        file: file.rel,
        pattern: pattern.name,
        snippet: trimmed.slice(0, 120)
      });
    }
  }
}

if (findings.length > 0) {
  console.error("Potential secrets found:");
  for (const finding of findings) {
    console.error(`- [${finding.pattern}] ${finding.file}: ${finding.snippet}`);
  }
  process.exit(1);
}

console.log("No potential secrets found in tracked source files.");
