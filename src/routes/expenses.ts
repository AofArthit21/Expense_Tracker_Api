import { Router } from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
} from "../controllers/expenseController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   GET /api/expenses/stats
 * @desc    Get expense statistics
 * @access  Private
 */
router.get("/stats", getExpenseStats);

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses for authenticated user
 * @access  Private
 * @query   page, limit, category, startDate, endDate
 */
router.get("/", getExpenses);

/**
 * @route   POST /api/expenses
 * @desc    Create a new expense
 * @access  Private
 */
router.post("/", createExpense);

/**
 * @route   GET /api/expenses/:id
 * @desc    Get expense by ID
 * @access  Private
 */
router.get("/:id", getExpenseById);

/**
 * @route   PUT /api/expenses/:id
 * @desc    Update expense by ID
 * @access  Private
 */
router.put("/:id", updateExpense);

/**
 * @route   DELETE /api/expenses/:id
 * @desc    Delete expense by ID
 * @access  Private
 */
router.delete("/:id", deleteExpense);

export default router;
