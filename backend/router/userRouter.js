import express from "express";
import {
  login,
  userRegister,
  getUserDetails,
  logoutUser,
  updatePassword,
  resetPassword
} from "../controller/userController.js";
import {
  isAdminAuthenticated,
  isUserAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", userRegister);
router.post("/login", login);
router.get("/user/me", isUserAuthenticated, getUserDetails);
router.get("/userlogout", isUserAuthenticated, logoutUser);
router.put("/updatepass", isUserAuthenticated, updatePassword);
router.put("/resetpass", resetPassword);

export default router;
