require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// 🔥 ADD THIS ROUTE (VERY IMPORTANT)
app.post("/query", (req, res) => {
  const { question } = req.body;

  console.log("Received question:", question);

  res.json({
    answer: `You asked: ${question} (dummy response)`
  });
});

// IMPORTANT: THIS MUST EXIST
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
