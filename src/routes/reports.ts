import { Router } from "express";
import {
  getCategoryReport,
  getMonthlyReport,
  getExpenseTrends,
  getExpenseSummary,
} from "../controllers/reportController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @route   GET /api/reports/category
 * @desc    Get expense report grouped by category
 * @access  Private
 * @query   startDate (required), endDate (required)
 */
router.get("/category", getCategoryReport);

/**
 * @route   GET /api/reports/monthly
 * @desc    Get monthly expense report
 * @access  Private
 * @query   year (optional, default: current year)
 */
router.get("/monthly", getMonthlyReport);

/**
 * @route   GET /api/reports/trends
 * @desc    Get expense trends over specified period
 * @access  Private
 * @query   days (optional, default: 30)
 */
router.get("/trends", getExpenseTrends);

/**
 * @route   GET /api/reports/summary
 * @desc    Get comprehensive expense summary
 * @access  Private
 */
router.get("/summary", getExpenseSummary);

export default router;
