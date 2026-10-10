
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Product = require("../models/product.model");

beforeAll(async () => {
  if (!process.env.TEST_MONGO_URI) {
    throw new Error("TEST_MONGO_URI is missing from backend/.env");
  }

  await mongoose.connect(process.env.TEST_MONGO_URI);
});

beforeEach(async () => {
  await Product.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe("Product API", () => {
  test("GET /api/products returns an empty list", async () => {
    const response = await request(app).get("/api/products");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([]);
  });

  test("POST /api/products creates a product", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({
        name: "Test Keyboard",
        price: 799,
        image: "https://placehold.co/400x300",
        description: "Automated test product",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe("Test Keyboard");
    expect(response.body.data.price).toBe(799);
  });

  test("POST rejects an empty product name", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({
        name: "",
        price: 799,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("PUT updates an existing product", async () => {
    const product = await Product.create({
      name: "Old Keyboard",
      price: 500,
    });

    const response = await request(app)
      .put(`/api/products/${product._id}`)
      .send({
        name: "Updated Keyboard",
        price: 900,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe("Updated Keyboard");
    expect(response.body.data.price).toBe(900);
  });

  test("DELETE removes an existing product", async () => {
    const product = await Product.create({
      name: "Keyboard to Delete",
      price: 500,
    });

    const response = await request(app)
      .delete(`/api/products/${product._id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const deletedProduct = await Product.findById(product._id);
    expect(deletedProduct).toBeNull();
  });

  test("GET rejects an invalid product ID", async () => {
    const response = await request(app).get(
      "/api/products/invalid-id"
    );

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
