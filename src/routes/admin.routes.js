const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const authenticate = require("../middleware/authenticate");
const isAdmin = require("../middleware/isAdmin");

router.use(authenticate);
router.use(isAdmin);

router.get("/stats", adminController.getStats);
router.get("/verifications", adminController.getVerifications);
router.patch("/verifications/:id", adminController.updateVerification);
router.get("/users", adminController.getUsers);

module.exports = router;
