const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const productRoutes = require("./routes/product.route");

const app = express();

app.use(
  cors({
    origin: (process.env.FRONTEND_URL || "http://localhost:5173")
      .split(",")
      .map((url) => url.trim()),
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "MERN Product Store API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "MERN Product Store API" });
});

app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();