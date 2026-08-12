import { readFile, readdir } from "node:fs/promises";
import { extname, join } from "node:path";

const forbiddenNames = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
  "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_SECRET_KEY",
];
const forbiddenPayloads = [/"role"\s*:\s*"service_role"/i, /service[_-]?role/i];
const scanRoots = [".next/static", ".next/server/app"];

async function filesUnder(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(root, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  }));
  return nested.flat();
}

const configuredNames = Object.keys(process.env);
const unsafeConfiguration = forbiddenNames.filter((name) => configuredNames.includes(name));
if (unsafeConfiguration.length) {
  throw new Error(`Privileged Supabase variables must not be configured in the web build: ${unsafeConfiguration.join(", ")}`);
}

const files = (await Promise.all(scanRoots.map((root) => filesUnder(root).catch(() => []))))
  .flat()
  .filter((path) => [".js", ".json", ".html", ".txt"].includes(extname(path)));
const findings = [];
for (const path of files) {
  const contents = await readFile(path, "utf8");
  if (forbiddenNames.some((name) => contents.includes(name)) || forbiddenPayloads.some((pattern) => pattern.test(contents))) {
    findings.push(path);
  }
}

if (findings.length) {
  throw new Error(`A privileged Supabase marker reached generated application output:\n${findings.join("\n")}`);
}

console.log(`Verified ${files.length} generated files: no privileged Supabase key markers found.`);
