const reviewsService = require("../services/reviews.service");

const createReview = async (req, res, next) => {
  try {
    const result = await reviewsService.createReview(req.body, req.user.id);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const getFarmerReviews = async (req, res, next) => {
  try {
    const result = await reviewsService.getFarmerReviews(req.params.farmerId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const getMyReviews = async (req, res, next) => {
  try {
    const result = await reviewsService.getMyReviews(req.user.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, getFarmerReviews, getMyReviews };
