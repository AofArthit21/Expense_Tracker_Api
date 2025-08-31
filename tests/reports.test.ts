import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import { User } from "../src/models/User";
import { Expense } from "../src/models/Expense";
import { connectDatabase, disconnectDatabase } from "../src/utils/database";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI;

describe("Report Endpoints", () => {
  let token: string;

  beforeAll(async () => {
    process.env.MONGODB_URI = MONGODB_TEST_URI;
    await connectDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await disconnectDatabase();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Expense.deleteMany({});

    const res = await request(app).post("/api/auth/register").send({
      name: "Tester",
      email: "test@example.com",
      password: "Password123",
    });
    token = res.body.data.token;

    await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Groceries",
        amount: 200,
        date: new Date().toISOString(),
        category: "Shopping",
      });
  });

  it("should generate category report", async () => {
    const res = await request(app)
      .get("/api/reports/category?startDate=2025-01-01&endDate=2025-12-31")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.categoryBreakdown.length).toBeGreaterThan(0);
  });

  it("should generate expense summary", async () => {
    const res = await request(app)
      .get("/api/reports/summary")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.overview.totalExpenses).toBeGreaterThan(0);
  });

  // ❌ Category report missing params
  it("should fail category report with missing dates", async () => {
    const res = await request(app)
      .get("/api/reports/category") // ไม่มี startDate, endDate
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation error");
  });

  // ✅ Monthly report with no data
  it("should return monthly report even if no data", async () => {
    const res = await request(app)
      .get("/api/reports/monthly?year=1999") // ปีที่ไม่มี data
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.yearlyTotal).toBe(0);
  });
});
