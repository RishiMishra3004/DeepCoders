import fs from "fs";
import path from "path";
import {storage_dir} from "../app.js";
import getFolderSize from "./folderSize.js";

// Function to calculate folder size recursively
export default function updateFileFolderSize(latestUpdatedPath, userSt, projectName){
  
  const userDir = path.resolve(storage_dir, userSt.userId);
  const now = new Date();

  // Recursively update sizes and timestamps
  let currentDir = latestUpdatedPath;
  while (currentDir !== userDir) {
    const parentDir = path.dirname(currentDir);
    const parentFolder = userSt.folders.find((folder) => folder.folderPath === parentDir);

    if (parentFolder) {
      parentFolder.size = getFolderSize(parentDir);
      parentFolder.lastUpdated = now;
    }

    currentDir = parentDir;
  }

  // Update the user directory itself
  const userFolder = userSt.folders.find((folder) => folder.folderPath === userDir);
  if (userFolder) {
    userFolder.size = getFolderSize(userDir);
    userFolder.lastUpdated = now;
  }

  console.log("Size updated.")
}