import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

export default async function (context) {
  try {
    const appOutDir = context.appOutDir;
    const sandboxPath = path.join(appOutDir, "chrome-sandbox");
    execSync(`chmod 4755 "${sandboxPath}"`);
    console.log("✅ chrome-sandbox permissions fixed successfully");
  } catch (error) {
    console.warn("⚠️ Could not fix chrome-sandbox permissions:", error.message);
  }
}
