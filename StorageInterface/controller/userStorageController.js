import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { UserStorage } from "../models/userStorageSchema.js";
import ErrorHandler from "../middlewares/error.js";
import {storage_dir} from "../app.js";
import fs from "fs";
import path from "path";
import getFolderSize from "../utils/folderSize.js";
import { createEnv } from "../pythonUtils/Venv.js";
import updateFileFolderSize from "../utils/sizeUpdate.js";

export const createUserDir = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.body;
  
  if (!id || typeof id !== "string") {
    return next(new ErrorHandler("Invalid or missing user ID", 400));
  }

  const userDir = path.resolve(storage_dir, id);
  
  let userStorageDir;
  let message;

  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });

    const folderSize = getFolderSize(userDir);

    message = `user directory with id ${id} created.`;
    console.log(message);

    userStorageDir = await UserStorage.create({
      userId : id,
      folders : [
        {
          folderName : id,
          folderPath : userDir,
          size : folderSize,
        },
      ],
    });
  }
  else{
    message = `user directory with id ${id} already exists.`;
    console.log(message);

    userStorageDir = await UserStorage.findOne({ userId: id });

    if (!userStorageDir) {
      return next(new ErrorHandler(`Directory exists but no UserStorage record found for ID ${id}`,404));
    }
  }
  
  res.status(200).json({
    success: true,
    message,
    userStorageDir
  });
});

export const createNewProject = catchAsyncErrors(async (req, res, next) => {
  const { id, 
    projectName, 
    description, } = req.body;

  // Validate required fields
  if (!id || !projectName) {
    return next(new ErrorHandler("Invalid or missing required details.", 400));
  }

  const userDir = path.resolve(storage_dir, id);
  const projectDir = path.resolve(userDir, projectName);

  // Check if user directory exists
  if (!fs.existsSync(userDir)) {
    return next(new ErrorHandler(`User directory with id ${id} does not exist.`, 404));
  }

  // Check if project directory exists
  if (fs.existsSync(projectDir)) {
    return next(new ErrorHandler(`Project directory ${projectName} already exists.`, 400));
  }

  // Create project directory
  fs.mkdirSync(projectDir, { recursive: true });

  // Add project directory to UserStorage schema
  const userSt = await UserStorage.findOne({ userId: id });

  if (!userSt) {
    return next(new ErrorHandler(`No UserStorage record found for ID ${id}.`, 404));
  }

  const folderSize = getFolderSize(projectDir);
  const now = new Date();

  // Add the new project folder
  userSt.folders.push({
    folderName: projectName,
    folderPath: projectDir,
    size: folderSize,
    lastUpdated: now,
    description,
  });

  userSt.projects.push({
    projectName,
    description,
  });

  updateFileFolderSize(projectDir, userSt, projectName);

  await userSt.save();

  res.status(201).json({
    success: true,
    messages: [
      `Project directory ${projectName} created successfully.`,
     ],
    userSt,
  });
});

export const createNewEnv = catchAsyncErrors(async (req, res, next) => {
  const {
    userId,
    projectName,
    envName,
    pythonEnvVersion,
    externalLibs,
    osType
  } = req.body;

  if (!envName || !pythonEnvVersion || !osType) {
    return next(new ErrorHandler("Invalid or missing required details.", 400));
  }

  

  // Create Python environment
  const envDir = path.join(projectDir, envName);

  createEnv(envDir, pythonEnvVersion)
  .then(() => {
    console.log("Environment creation successful!");
  })
  .catch((error) => {
    console.error(`Environment creation failed: ${error.message}`);
    return next(new ErrorHandler(`Environment creation failed: ${error.message}`, 400));
  });
});
