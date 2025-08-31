import mongoose, { Document, Schema } from "mongoose";

export interface IExpense extends Document {
  title: string;
  amount: number;
  date: Date;
  category: string;
  notes?: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export enum ExpenseCategory {
  FOOD = "Food",
  TRANSPORTATION = "Transportation",
  ENTERTAINMENT = "Entertainment",
  HEALTHCARE = "Healthcare",
  SHOPPING = "Shopping",
  UTILITIES = "Utilities",
  EDUCATION = "Education",
  TRAVEL = "Travel",
  OTHER = "Other",
}

const expenseSchema = new Schema<IExpense>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
      max: [1000000, "Amount cannot exceed 1,000,000"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      validate: {
        validator: function (value: Date) {
          return value <= new Date();
        },
        message: "Date cannot be in the future",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: Object.values(ExpenseCategory),
        message: "Category must be one of: {VALUES}",
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot be more than 500 characters"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for faster queries
expenseSchema.index({ userId: 1, createdAt: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, date: -1 });

// Virtual for formatted amount
expenseSchema.virtual("formattedAmount").get(function () {
  return `$${this.amount.toFixed(2)}`;
});

export const Expense = mongoose.model<IExpense>("Expense", expenseSchema);
