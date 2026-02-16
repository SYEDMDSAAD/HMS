import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

// Resolved against this file rather than the process working directory, so the
// server behaves the same whether it is started from backend/ or the repo root.
//
// This lives in its own module and is imported first by app.js: ES imports are
// evaluated in declaration order, so putting it at the top guarantees the .env
// is loaded before any other module runs — including ones that read
// process.env at module scope.
config({ path: path.join(currentDir, "config.env") });
