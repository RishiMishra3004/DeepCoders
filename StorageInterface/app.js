import express from "express";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dbConnection } from "./database/dbConnection.js";
import userStorageRouter from "./router/userStorageRouter.js";
import { errorMiddleware } from "./middlewares/error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
config({ path: "./config/config.env" });

app.use(
  cors({
    origin: [process.env.FRONTEND_URL_ONE, process.env.FRONTEND_URL_TWO],
    method: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

const base = path.resolve(__dirname, process.env.BASE_DIR);

// Ensure base directory exists
if (!fs.existsSync(base)) {
  fs.mkdirSync(base, { recursive: true });
  console.log('Base storage directory created.');
}
else{
  console.log("Base already exists.");
}

app.use("/userStorage", userStorageRouter);

dbConnection();
app.use(errorMiddleware);


export const storage_dir = base;
export default app;
