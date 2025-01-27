import fs from "fs";
import path from "path";

// Function to calculate folder size recursively
export default function getFolderSize(folderPath) {
  let totalSize = 0;

  // Read all items in the folder
  const items = fs.readdirSync(folderPath);

  // Iterate through each item
  for (const item of items) {
    const itemPath = path.join(folderPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      // Recursively calculate size for subdirectories
      totalSize += getFolderSize(itemPath);
    } else {
      // Add file size
      totalSize += stats.size;
    }
  }

  return totalSize;
}