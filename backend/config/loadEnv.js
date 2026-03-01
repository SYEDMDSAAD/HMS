import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(currentDir, "config.env");

// Resolved against this file rather than the process working directory, so the
// server behaves the same whether it is started from backend/ or the repo root.
//
// This lives in its own module and is imported first by app.js: ES imports are
// evaluated in declaration order, so putting it at the top guarantees the .env
// is loaded before any other module runs — including ones that read
// process.env at module scope.
const result = config({ path: envPath });

if (result.error) {
  // Not fatal: a hosted deployment usually injects environment variables
  // directly instead of shipping a file. app.js validates that whatever is
  // required actually arrived, so this only needs to explain the situation.
  if (result.error.code === "ENOENT") {
    console.warn(
      `No env file at ${envPath} — falling back to variables already present in the environment.`
    );
  } else {
    console.warn(`Could not read ${envPath}: ${result.error.message}`);
  }
}
