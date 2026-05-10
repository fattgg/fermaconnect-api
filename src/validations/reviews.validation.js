const Joi = require("joi");

const createReviewSchema = Joi.object({
  order_id: Joi.string().uuid().required().messages({
    "any.required": "Order ID is required",
    "string.uuid": "Order ID must be a valid UUID",
  }),

  rating: Joi.number().integer().min(1).max(5).required().messages({
    "any.required": "Rating is required",
    "number.min": "Rating must be at least 1",
    "number.max": "Rating must be at most 5",
  }),

  comment: Joi.string().max(500).optional().allow(""),
});

module.exports = { createReviewSchema };
