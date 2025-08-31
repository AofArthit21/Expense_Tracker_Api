import { Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Expense } from "../models/Expense.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { reportQuerySchema } from "../utils/validation.js";

/**
 * Get report grouped by category
 */
export const getCategoryReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate query parameters
    const { error, value } = reportQuerySchema.validate(req.query);
    if (error) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      });
      return;
    }

    const { startDate, endDate } = value;
    const userId = req.userId;

    // Aggregate expenses by category
    const categoryTotals = await Expense.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
          expenses: {
            $push: {
              id: "$_id",
              title: "$title",
              amount: "$amount",
              date: "$date",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalAmount: { $round: ["$totalAmount", 2] },
          count: 1,
          avgAmount: { $round: ["$avgAmount", 2] },
          expenses: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Calculate grand totals
    const grandTotal = categoryTotals.reduce(
      (sum, c) => sum + c.totalAmount,
      0
    );
    const totalCount = categoryTotals.reduce((sum, c) => sum + c.count, 0);

    // Add percentage for each category
    const categoriesWithPercentage = categoryTotals.map((c) => ({
      ...c,
      percentage:
        grandTotal > 0
          ? Math.round((c.totalAmount / grandTotal) * 100 * 100) / 100
          : 0,
    }));

    res.status(200).json({
      success: true,
      message: "Category report generated successfully",
      data: {
        dateRange: { startDate, endDate },
        summary: {
          grandTotal: Math.round(grandTotal * 100) / 100,
          totalCount,
          avgExpense:
            totalCount > 0
              ? Math.round((grandTotal / totalCount) * 100) / 100
              : 0,
          categoriesCount: categoryTotals.length,
        },
        categoryBreakdown: categoriesWithPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get expense trends (daily + top categories)
 */
export const getExpenseTrends = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    const days = parseInt(req.query.days as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Daily expense trends
    const dailyTrends = await Expense.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          categories: { $addToSet: "$category" },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          totalAmount: { $round: ["$totalAmount", 2] },
          count: 1,
          categoriesCount: { $size: "$categories" },
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Top categories in the period
    const topCategories = await Expense.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalAmount: { $round: ["$totalAmount", 2] },
          count: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 },
    ]);

    // Summary
    const periodTotal = dailyTrends.reduce((sum, d) => sum + d.totalAmount, 0);
    const periodCount = dailyTrends.reduce((sum, d) => sum + d.count, 0);
    const dailyAverage =
      dailyTrends.length > 0 ? periodTotal / dailyTrends.length : 0;

    res.status(200).json({
      success: true,
      message: "Expense trends retrieved successfully",
      data: {
        period: { days, startDate, endDate: new Date() },
        summary: {
          periodTotal: Math.round(periodTotal * 100) / 100,
          periodCount,
          dailyAverage: Math.round(dailyAverage * 100) / 100,
          activeDays: dailyTrends.length,
        },
        dailyTrends,
        topCategories,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get overall expense summary
 */
export const getExpenseSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;

    const [
      totalExpenses,
      currentMonthExpenses,
      categoryBreakdown,
      recentExpenses,
    ] = await Promise.all([
      // Total expenses
      Expense.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
            avgAmount: { $avg: "$amount" },
            minAmount: { $min: "$amount" },
            maxAmount: { $max: "$amount" },
          },
        },
      ]),

      // Current month expenses
      Expense.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            date: {
              $gte: new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
              ),
              $lte: new Date(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                0
              ),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),

      // Category breakdown (top 5)
      Expense.aggregate([
        { $match: { userId: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: "$category",
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            totalAmount: { $round: ["$totalAmount", 2] },
            count: 1,
          },
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 5 },
      ]),

      // Recent expenses (last 5)
      Expense.find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title amount date category"),
    ]);

    const totalStats = totalExpenses[0] || {
      totalAmount: 0,
      count: 0,
      avgAmount: 0,
      minAmount: 0,
      maxAmount: 0,
    };

    const currentMonthStats = currentMonthExpenses[0] || {
      totalAmount: 0,
      count: 0,
    };

    res.status(200).json({
      success: true,
      message: "Expense summary retrieved successfully",
      data: {
        overview: {
          totalExpenses: Math.round(totalStats.totalAmount * 100) / 100,
          totalCount: totalStats.count,
          averageExpense: Math.round(totalStats.avgAmount * 100) / 100,
          minExpense: Math.round(totalStats.minAmount * 100) / 100,
          maxExpense: Math.round(totalStats.maxAmount * 100) / 100,
        },
        currentMonth: {
          totalAmount: Math.round(currentMonthStats.totalAmount * 100) / 100,
          count: currentMonthStats.count,
        },
        topCategories: categoryBreakdown,
        recentExpenses,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get monthly report
 */
export const getMonthlyReport = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    // Aggregate expenses by month
    const monthlyTotals = await Expense.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          date: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          totalAmount: { $round: ["$totalAmount", 2] },
          count: 1,
          avgAmount: { $round: ["$avgAmount", 2] },
        },
      },
      { $sort: { month: 1 } },
    ]);

    // Fill in missing months
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const completeMonthlyData = monthNames.map((name, index) => {
      const monthData = monthlyTotals.find((m) => m.month === index + 1);
      return {
        month: index + 1,
        monthName: name,
        totalAmount: monthData ? monthData.totalAmount : 0,
        count: monthData ? monthData.count : 0,
        avgAmount: monthData ? monthData.avgAmount : 0,
      };
    });

    // Yearly summary
    const yearlyTotal = monthlyTotals.reduce(
      (sum, m) => sum + m.totalAmount,
      0
    );
    const yearlyCount = monthlyTotals.reduce((sum, m) => sum + m.count, 0);

    res.status(200).json({
      success: true,
      message: "Monthly report generated successfully",
      data: {
        year,
        summary: {
          yearlyTotal: Math.round(yearlyTotal * 100) / 100,
          yearlyCount,
          monthlyAverage: Math.round((yearlyTotal / 12) * 100) / 100,
          activeMonths: monthlyTotals.length,
        },
        monthlyBreakdown: completeMonthlyData,
      },
    });
  } catch (error) {
    next(error);
  }
};
