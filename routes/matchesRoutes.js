const express = require("express");
const { sendSwipe } = require("../controllers/Match/matchesController");
const authMiddleware = require("../middlewares/AuthMiddleware");

const matchRoutes = express.Router();

matchRoutes.post("/swipe", authMiddleware, sendSwipe);

module.exports = matchRoutes;
