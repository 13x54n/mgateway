require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const fileRoutes = require("./routes/file.routes");
const mongoose = require("mongoose");
const path = require("path");
const supportCaseRouter = require("./routes/supportCase.routes");

const app = express();

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"));

// Static files
app.use("/public", express.static(path.join(__dirname, "public")));

// Routes
app.use("/", fileRoutes);
app.use("/", supportCaseRouter);

module.exports = app;
