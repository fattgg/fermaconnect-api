const Joi = require('joi');

const createOrderSchema = Joi.object({
  product_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'any.required': 'Product ID is required',
      'string.uuid':  'Product ID must be a valid UUID',
    }),

  quantity: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'any.required': 'Quantity is required',
      'number.min':   'Quantity must be at least 1',
    }),

  contact_info: Joi.string()
    .min(5)
    .max(150)
    .required()
    .messages({
      'any.required': 'Contact info is required',
      'string.min':   'Contact info must be at least 5 characters',
    }),

  note: Joi.string()
    .max(500)
    .optional()
    .allow(''),
});

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('accepted', 'rejected', 'completed')
    .required()
    .messages({
      'any.required': 'Status is required',
      'any.only':     'Status must be one of: accepted, rejected, completed',
    }),
});

module.exports = { createOrderSchema, updateStatusSchema };