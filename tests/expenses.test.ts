import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import { User } from "../src/models/User";
import { Expense } from "../src/models/Expense";
import { connectDatabase, disconnectDatabase } from "../src/utils/database";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI;

describe("Expense Endpoints", () => {
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
  });

  it("should create expense", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Lunch",
        amount: 100,
        date: new Date().toISOString(),
        category: "Food",
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.expense.title).toBe("Lunch");
  });

  it("should list expenses", async () => {
    await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Coffee",
        amount: 50,
        date: new Date().toISOString(),
        category: "Food",
      });

    const res = await request(app)
      .get("/api/expenses?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.expenses.length).toBeGreaterThan(0);
  });

  // ❌ Create expense validation fail
  it("should fail create expense with invalid amount", async () => {
    const res = await request(app)
      .post("/api/expenses")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Invalid Expense",
        amount: "abc", // ไม่ใช่ number
        date: new Date().toISOString(),
        category: "Food",
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Validation error");
  });

  // ❌ Get expense by id invalid
  it("should return 400 for invalid expense id", async () => {
    const res = await request(app)
      .get("/api/expenses/invalid-id")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid expense ID");
  });

  // ❌ Delete expense not found
  it("should return 404 when deleting non-existing expense", async () => {
    const nonExistingId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/expenses/${nonExistingId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Expense not found");
  });
});
