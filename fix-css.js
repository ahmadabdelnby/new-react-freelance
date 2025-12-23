import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixCSSFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Check if file contains the error
    if (!content.includes("param($match)")) {
      return false;
    }

    // Replace the PowerShell code with proper font-size
    const pattern =
      /\s*param\(\$match\)\s+\$size = \[int\]\$match\.Groups\[1\]\.Value\s+\$newSize = \[Math\]::Max\(\$size - 3, 8\)\s+"font-size: \$\{newSize\}px"\s*;/gs;

    const fixed = content.replace(pattern, " font-size: 14px;");

    if (fixed !== content) {
      fs.writeFileSync(filePath, fixed, "utf8");
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function findAndFixCSS(dir) {
  let fixedCount = 0;

  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith(".css")) {
        if (fixCSSFile(filePath)) {
          console.log(`✓ Fixed: ${filePath}`);
          fixedCount++;
        }
      }
    }
  }

  walkDir(dir);
  return fixedCount;
}

console.log("Starting CSS fix...\n");
const srcPath = path.join(__dirname, "src");
const count = findAndFixCSS(srcPath);
console.log(`\nCompleted! Fixed ${count} files.`);
