import express from "express";
import { updateProfile } from "../contollers/authCtrl.mjs";

const authRouter = express.Router();

authRouter.post("/update", updateProfile);

export default authRouter;
