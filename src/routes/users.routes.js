const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const authenticate = require("../middleware/authenticate");

router.post("/push-token", authenticate, usersController.savePushToken);

module.exports = router;
