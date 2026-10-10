const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/product.model");

const router = express.Router();

// GET: Fetch all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Create a product
router.post("/", async (req, res) => {
  try {
    const { name, price, image } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof image !== "string" ||
      !image.trim() ||
      price === "" ||
      price === null ||
      price === undefined ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid name, price, and image are required.",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      image: image.trim(),
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT: Update a product
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const { name, price, image } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof image !== "string" ||
      !image.trim() ||
      price === "" ||
      price === null ||
      price === undefined ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid name, price, and image are required.",
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        price: Number(price),
        image: image.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE: Remove a product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;