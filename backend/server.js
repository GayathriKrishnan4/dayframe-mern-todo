
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./db");
const todoRoutes = require("./todoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Home page
app.get("/", (req, res) => {
    res.send(`
        <h1>Todo App</h1>
        <p>Welcome to the Todo application!</p>
        <p>Backend server is running successfully.</p>
    `);
});

// Developer name
app.get("/name", (req, res) => {
    res.type("text").send(
        `Developer Name: ${process.env.DEVELOPER_NAME}`
    );
});

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        message: "Backend is running successfully!"
    });
});

// Todo routes
app.use("/api/todos", todoRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
