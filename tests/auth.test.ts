import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import { User } from "../src/models/User";
import { connectDatabase, disconnectDatabase } from "../src/utils/database";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI;

describe("Authentication Endpoints", () => {
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
  });

  describe("POST /api/auth/register", () => {
    const validUserData = {
      name: "John Doe99",
      email: "john@example.com",
      password: "Password123",
    };

    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toMatchObject({
        name: validUserData.name,
        email: validUserData.email,
      });
      expect(response.body.data.user.password).toBeUndefined();
    });

    it("should not register with duplicate email", async () => {
      await request(app).post("/api/auth/register").send(validUserData);
      const response = await request(app)
        .post("/api/auth/register")
        .send(validUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("User with this email already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    const userData = {
      name: "John Doe99",
      email: "john@example.com",
      password: "Password123",
    };

    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(userData);
    });

    it("should login successfully", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it("should not login with wrong password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: userData.email, password: "wrong" })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid email or password");
    });
  });

  describe("GET /api/auth/profile", () => {
    let token: string;

    beforeEach(async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "John",
        email: "john@example.com",
        password: "Password123",
      });
      token = res.body.data.token;
    });

    it("should get profile with valid token", async () => {
      const res = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe("john@example.com");
    });

    it("should fail without token", async () => {
      const res = await request(app).get("/api/auth/profile").expect(401);
      expect(res.body.success).toBe(false);
    });

    // ❌ Register validation fail
    it("should fail register with invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Bad Email",
          email: "not-an-email",
          password: "Password123",
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation error");
    });

    // ❌ Login validation fail
    it("should fail login without password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com" }) // ไม่มี password
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Validation error");
    });

    // ❌ Update profile validation fail
    it("should fail update profile with short name", async () => {
      const res = await request(app)
        .put("/api/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "A" }) // น้อยกว่า 2 ตัวอักษร
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Name must be at least 2 characters long");
    });
  });
});
