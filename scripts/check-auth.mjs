import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [auth, register, students] = await Promise.all([
  read("src/lib/authOptions.ts"),
  read("src/app/api/auth/register/route.ts"),
  read("src/app/api/students/route.ts"),
]);

assert.doesNotMatch(auth, /token\.role\s*=\s*session\.role/);
assert.doesNotMatch(register, /bcrypt\.hash/);
assert.match(students, /requireRole\("admin"\)/);

console.log("Authentication security checks passed.");
