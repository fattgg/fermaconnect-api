const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(150)
    .required()
    .messages({
      'any.required': 'Product name is required',
      'string.min':   'Product name must be at least 2 characters',
    }),

  category: Joi.string()
    .valid(
      'vegetables',
      'fruits',
      'dairy',
      'meat',
      'honey',
      'eggs',
      'grains',
      'herbs',
      'other'
    )
    .required()
    .messages({
      'any.required': 'Category is required',
      'any.only':     'Invalid category',
    }),

  description: Joi.string()
    .max(1000)
    .optional()
    .allow(''),

  price: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'any.required':  'Price is required',
      'number.positive': 'Price must be a positive number',
    }),

  unit: Joi.string()
    .valid('kg', 'piece', 'bundle', 'litre', 'gram', 'dozen')
    .required()
    .messages({
      'any.required': 'Unit is required',
      'any.only':     'Unit must be one of: kg, piece, bundle, litre, gram, dozen',
    }),

  quantity: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'any.required': 'Quantity is required',
      'number.min':   'Quantity cannot be negative',
    }),
});

const updateProductSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(150)
    .optional(),

  category: Joi.string()
    .valid(
      'vegetables',
      'fruits',
      'dairy',
      'meat',
      'honey',
      'eggs',
      'grains',
      'herbs',
      'other'
    )
    .optional(),

  description: Joi.string()
    .max(1000)
    .optional()
    .allow(''),

  price: Joi.number()
    .positive()
    .precision(2)
    .optional(),

  unit: Joi.string()
    .valid('kg', 'piece', 'bundle', 'litre', 'gram', 'dozen')
    .optional(),

  quantity: Joi.number()
    .integer()
    .min(0)
    .optional(),
});

module.exports = { createProductSchema, updateProductSchema };