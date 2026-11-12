// Copia a exportação estática do Next (./out) para os recursos do Spring Boot,
// de forma que a API e o site sejam servidos pelo mesmo processo e domínio.
//
// Uso:
//   npm run build          # gera ./out e sincroniza backend/src/main/resources/static
//   npm run build -- --skip-copy
//
// A pasta de destino é limpa antes da cópia para não deixar arquivos órfãos.

import { existsSync, rmSync, cpSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const frontendDir = resolve(here, "..");
const source = resolve(frontendDir, "out");
const target = resolve(frontendDir, "..", "backend", "src", "main", "resources", "static");

const skip = process.argv.includes("--skip-copy");

if (!existsSync(source)) {
  console.error(`[copy-static] exportação não encontrada em ${source}. Rode "next build" antes.`);
  process.exit(1);
}

if (skip) {
  console.log("[copy-static] cópia ignorada (--skip-copy).");
  process.exit(0);
}

rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });

const total = readdirSync(target, { recursive: true }).filter((entry) =>
  /\.[a-z0-9]+$/i.test(String(entry))
).length;

console.log(`[copy-static] ${total} arquivos copiados para ${target}`);
