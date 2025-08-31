import Joi from "joi";
import { ExpenseCategory } from "../models/Expense.js";

// User validation schemas
export const userRegisterSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot be more than 50 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"))
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      "any.required": "Password is required",
    }),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// Expense validation schemas
export const expenseCreateSchema = Joi.object({
  title: Joi.string().min(1).max(100).required().messages({
    "string.min": "Title cannot be empty",
    "string.max": "Title cannot be more than 100 characters",
    "any.required": "Title is required",
  }),
  amount: Joi.number()
    .positive()
    .max(1000000)
    .precision(2)
    .required()
    .messages({
      "number.positive": "Amount must be greater than 0",
      "number.max": "Amount cannot exceed 1,000,000",
      "any.required": "Amount is required",
    }),
  date: Joi.date().max("now").required().messages({
    "date.max": "Date cannot be in the future",
    "any.required": "Date is required",
  }),
  category: Joi.string()
    .valid(...Object.values(ExpenseCategory))
    .required()
    .messages({
      "any.only": `Category must be one of: ${Object.values(ExpenseCategory).join(", ")}`,
      "any.required": "Category is required",
    }),
  notes: Joi.string().max(500).allow("").optional().messages({
    "string.max": "Notes cannot be more than 500 characters",
  }),
});

export const expenseUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(100).optional().messages({
    "string.min": "Title cannot be empty",
    "string.max": "Title cannot be more than 100 characters",
  }),
  amount: Joi.number()
    .positive()
    .max(1000000)
    .precision(2)
    .optional()
    .messages({
      "number.positive": "Amount must be greater than 0",
      "number.max": "Amount cannot exceed 1,000,000",
    }),
  date: Joi.date().max("now").optional().messages({
    "date.max": "Date cannot be in the future",
  }),
  category: Joi.string()
    .valid(...Object.values(ExpenseCategory))
    .optional()
    .messages({
      "any.only": `Category must be one of: ${Object.values(ExpenseCategory).join(", ")}`,
    }),
  notes: Joi.string().max(500).allow("").optional().messages({
    "string.max": "Notes cannot be more than 500 characters",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

// Query validation schemas
export const expenseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    "number.base": "Limit must be a number",
    "number.integer": "Limit must be an integer",
    "number.min": "Limit must be at least 1",
    "number.max": "Limit cannot exceed 100",
  }),
  category: Joi.string()
    .valid(...Object.values(ExpenseCategory))
    .optional()
    .messages({
      "any.only": `Category must be one of: ${Object.values(ExpenseCategory).join(", ")}`,
    }),
  startDate: Joi.date().optional().messages({
    "date.base": "Start date must be a valid date",
  }),
  endDate: Joi.date()
    .optional()
    .when("startDate", {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref("startDate")),
      otherwise: Joi.date(),
    })
    .messages({
      "date.base": "End date must be a valid date",
      "date.min": "End date must be after start date",
    }),
});

export const reportQuerySchema = Joi.object({
  startDate: Joi.date().required().messages({
    "date.base": "Start date must be a valid date",
    "any.required": "Start date is required",
  }),
  endDate: Joi.date().required().min(Joi.ref("startDate")).messages({
    "date.base": "End date must be a valid date",
    "date.min": "End date must be after start date",
    "any.required": "End date is required",
  }),
});
