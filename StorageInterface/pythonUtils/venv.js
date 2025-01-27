import { spawn } from "child_process";
import ErrorHandler from "../middlewares/error.js";

/**
 * Function to create a Python environment using Conda with optional libraries.
 * @param {string} envDir - The directory where the environment should be created.
 * @param {string} pythonVersion - The Python version to install in the environment.
 * @param {Array<string>} libs - Optional list of libraries to install during environment creation.
 * @returns {Promise<void>} - Resolves when the environment is created successfully, rejects otherwise.
 */
export const createEnv = async (envDir, pythonVersion, libs = []) => {
  return new Promise((resolve, reject) => {
    const condaArgs = ["create", "--prefix", envDir, `python=${pythonVersion}`, ...libs, "-y"];
    const condaCreate = spawn("conda", condaArgs);

    condaCreate.stdout.on("data", (data) => {
      console.log(`Output: ${data}`);
    });

    condaCreate.stderr.on("data", (data) => {
      console.error(`Error: ${data}`);
    });

    condaCreate.on("close", (code) => {
      if (code === 0) {
        console.log(`Environment created successfully at ${envDir} with libraries: ${libs.join(", ")}`);
        resolve();
      } else {
        reject(new ErrorHandler(`Conda environment creation failed with exit code ${code}`, 500));
      }
    });

    condaCreate.on("error", (err) => {
      reject(new ErrorHandler(`Failed to spawn Conda process: ${err.message}`, 500));
    });
  });
};
