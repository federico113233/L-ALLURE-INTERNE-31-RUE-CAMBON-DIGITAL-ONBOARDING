// Minimal .env.local reader/writer for the CLI scripts (no dependency).
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = join(ROOT, ".env.local");

export function loadEnv() {
  if (!existsSync(ENV_PATH)) return {};
  const env = {};
  for (const line of readFileSync(ENV_PATH, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  for (const [k, v] of Object.entries(env)) if (!process.env[k]) process.env[k] = v;
  return env;
}

export function setEnvVar(key, value) {
  let text = existsSync(ENV_PATH) ? readFileSync(ENV_PATH, "utf8") : "";
  const re = new RegExp(`^${key}=.*$`, "m");
  text = re.test(text) ? text.replace(re, `${key}=${value}`) : `${text.replace(/\s*$/, "\n")}${key}=${value}\n`;
  writeFileSync(ENV_PATH, text);
}

export function requireEnv(key) {
  const v = process.env[key];
  if (!v) {
    console.error(`✗ ${key} is missing. Add it to .env.local (see .env.example).`);
    process.exit(1);
  }
  return v;
}
