import express from "express";
import { loginCtrl, updateProfile } from "../contollers/authCtrl.mjs";

const authRouter = express.Router();

authRouter.post("/update", updateProfile);
authRouter.post("/login", loginCtrl);

export default authRouter;
