import { Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Expense } from "../models/Expense.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import {
  expenseCreateSchema,
  expenseUpdateSchema,
  expenseQuerySchema,
} from "../utils/validation.js";

export const createExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate input
    const { error, value } = expenseCreateSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      });
      return;
    }

    const { title, amount, date, category, notes } = value;
    const userId = req.userId;

    // Create expense
    const expense = new Expense({
      title,
      amount,
      date,
      category,
      notes,
      userId: new Types.ObjectId(userId),
    });

    await expense.save();

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
};

export const getExpenses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate query parameters
    const { error, value } = expenseQuerySchema.validate(req.query);
    if (error) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      });
      return;
    }

    const { page, limit, category, startDate, endDate } = value;
    const userId = req.userId;

    // Build query
    const query: any = { userId: new Types.ObjectId(userId) };

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [expenses, totalCount] = await Promise.all([
      Expense.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Expense.countDocuments(query),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: "Expenses retrieved successfully",
      data: {
        expenses,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getExpenseById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid expense ID",
      });
      return;
    }

    // Find expense
    const expense = await Expense.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!expense) {
      res.status(404).json({
        success: false,
        message: "Expense not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Expense retrieved successfully",
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid expense ID",
      });
      return;
    }

    // Validate input
    const { error, value } = expenseUpdateSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      });
      return;
    }

    // Update expense
    const expense = await Expense.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
      },
      value,
      { new: true, runValidators: true }
    );

    if (!expense) {
      res.status(404).json({
        success: false,
        message: "Expense not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid expense ID",
      });
      return;
    }

    // Delete expense
    const expense = await Expense.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!expense) {
      res.status(404).json({
        success: false,
        message: "Expense not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
      data: { expense },
    });
  } catch (error) {
    next(error);
  }
};

export const getExpenseStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;

    // Get current month stats
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const [currentMonthStats, totalStats] = await Promise.all([
      // Current month stats
      Expense.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            date: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            totalCount: { $sum: 1 },
            avgAmount: { $avg: "$amount" },
          },
        },
      ]),
      // All time stats
      Expense.aggregate([
        {
          $match: { userId: new Types.ObjectId(userId) },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            totalCount: { $sum: 1 },
            avgAmount: { $avg: "$amount" },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      message: "Expense statistics retrieved successfully",
      data: {
        currentMonth: currentMonthStats[0] || {
          totalAmount: 0,
          totalCount: 0,
          avgAmount: 0,
        },
        allTime: totalStats[0] || {
          totalAmount: 0,
          totalCount: 0,
          avgAmount: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
