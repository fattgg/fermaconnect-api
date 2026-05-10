const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviews.controller");
const authenticate = require("../middleware/authenticate");
const authorise = require("../middleware/authorise");

router.get("/farmer/:farmerId", reviewsController.getFarmerReviews);

router.post(
  "/",
  authenticate,
  authorise("buyer"),
  reviewsController.createReview,
);

router.get(
  "/my",
  authenticate,
  authorise("buyer"),
  reviewsController.getMyReviews,
);

module.exports = router;