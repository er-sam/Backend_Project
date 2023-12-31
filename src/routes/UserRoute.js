import { Router } from "express";
import {
  changePassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccount,
  updateAvatar,
  updateCover,
} from "../controllers/UserController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { verifyJWt } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxcount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

//SECURE-ROUTE
router.route("/logout").post(verifyJWt, logoutUser);
router.route("/change-password").post(verifyJWt, changePassword);
router.route("/profile").get(verifyJWt, getCurrentUser);
router
  .route("/update-avatar")
  .post(
    verifyJWt,
    upload.single("avatar"),
    updateAvatar
  );
router
  .route("/update-cover")
  .post(
    verifyJWt,
    upload.single({ name: "coverImage", maxCount: 1 }),
    updateCover
  );
router.route("/update-account").post(verifyJWt, updateAccount);

export default router;
