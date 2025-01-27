import mongoose from "mongoose";
import path from "path";

const folderSchema = new mongoose.Schema({
  folderName: { type: String, required: true },
  folderPath: { type: String, required: true },
  size: { type: Number, default: 0 }, // Size in bytes
  createdAt: { type: Date, default: Date.now },
  lastUpdated: {type: Date, default: Date.now}
});

const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true }, // E.g., 'text/plain', 'image/jpeg'
  size: { type: Number, default: 0 }, // Size in bytes
  createdAt: { type: Date, default: Date.now },
  lastUpdated: {type: Date, default: Date.now}
});

const envSchema = new mongoose.Schema({
  envName: { type: String, required: true},
  pythonEnvVersion: { type: Number, required: true },
  externalLibs: { type: [String], default: [] },
  osType: { type: String, required: true, enum: ["Linux", "Windows", "macOS"] },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

const projectsSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  description: { type: String, default: "" },
  env: { type: [envSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

const userStorageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, "userId is Required!"],
  },
  folders: [folderSchema], // Array of folder subdocuments
  files: [fileSchema], // Array of file subdocuments
  projects: [projectsSchema], // Array of Projects subdocuments
});

userStorageSchema.pre("save", async function (next) {
  const userStorage = this;

  // Recursive function to update folder sizes
  const updateFolderSizes = () => {
    const folderMap = new Map();

    // Map folder paths to subdocument references
    userStorage.folders.forEach((folder) => {
      folderMap.set(folder.folderPath, folder);
    });

    // Calculate the depth of each folder
    const folderDepths = Array.from(folderMap.keys()).map((folderPath) => ({
      folderPath,
      depth: folderPath.split(path.sep).length,
    }));

    // Sort folders by depth in descending order (deepest folders first)
    folderDepths.sort((a, b) => b.depth - a.depth);

    // Update sizes recursively, starting from the deepest folders
    folderDepths.forEach(({ folderPath }) => {
      const folder = folderMap.get(folderPath);
      const subFiles = userStorage.files.filter((file) => path.dirname(file.filePath) === folderPath);
      const subFolders = folderDepths
        .filter(({ folderPath: subFolderPath }) => path.dirname(subFolderPath) === folderPath)
        .map(({ folderPath: subFolderPath }) => folderMap.get(subFolderPath));

      // Calculate size of files directly under this folder
      let folderSize = subFiles.reduce((acc, file) => acc + file.size, 0);

      // Add sizes of subfolders
      folderSize += subFolders.reduce((acc, subFolder) => acc + (subFolder?.size || 0), 0);

      // Update folder size and last updated time
      folder.size = folderSize;
      folder.lastUpdated = new Date();
    });
  };

  // Perform the size update
  updateFolderSizes();

  next();
});

export const UserStorage = mongoose.model("UserStorage", userStorageSchema);
