
const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/product.model");

const router = express.Router();

// Validate product request data
const validateProduct = (req, res, next) => {
  const { name, price, image, description } = req.body;

  if (typeof name !== "string" || name.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: "Product name must be at least 2 characters long.",
    });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: "Product name cannot exceed 100 characters.",
    });
  }

  if (
    price === undefined ||
    price === null ||
    price === "" ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Price must be a valid non-negative number.",
    });
  }

  if (image !== undefined && typeof image !== "string") {
    return res.status(400).json({
      success: false,
      message: "Image must be a string URL.",
    });
  }

  if (description !== undefined && typeof description !== "string") {
    return res.status(400).json({
      success: false,
      message: "Description must be a string.",
    });
  }

  next();
};

// GET: Fetch all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Fetch products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
    });
  }
});

// GET: Fetch one product
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Fetch product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch product.",
    });
  }
});

// POST: Create a product
router.post("/", validateProduct, async (req, res) => {
  try {
    const product = await Product.create({
      name: req.body.name.trim(),
      price: Number(req.body.price),
      image: req.body.image?.trim() || "https://placehold.co/400x300",
      description: req.body.description?.trim() || "",
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create product.",
    });
  }
});

// PUT: Update a product
router.put("/:id", validateProduct, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name: req.body.name.trim(),
        price: Number(req.body.price),
        image: req.body.image?.trim() || "https://placehold.co/400x300",
        description: req.body.description?.trim() || "",
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update product.",
    });
  }
});

// DELETE: Delete a product
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

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product.",
    });
  }
});

module.exports = router;
