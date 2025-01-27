import express from "express";
import {
  createUserDir,
  createNewProject
} from "../controller/userStorageController.js";


const router = express.Router();

router.post("/userDir", createUserDir);
router.post("/newProj", createNewProject);


export default router;
