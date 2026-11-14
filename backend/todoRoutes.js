
const express = require("express");
const router = express.Router();

const Todo = require("./Todo");

// GET - Display active tasks only
router.get("/", async (req, res) => {
    try {
        const todos = await Todo.find({ isTrashed: false })
            .sort({ createdAt: -1 });

        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET - Display trashed tasks
router.get("/trash", async (req, res) => {
    try {
        const todos = await Todo.find({ isTrashed: true })
            .sort({ updatedAt: -1 });

        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST - Add a new task
router.post("/", async (req, res) => {
    try {
        const newTodo = new Todo({
            title: req.body.title,
            category: req.body.category || "Personal",
            priority: req.body.priority || "Medium"
        });

        const savedTodo = await newTodo.save();
        res.status(201).json(savedTodo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT - Update a task
router.put("/:id", async (req, res) => {
    try {
        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: req.params.id, isTrashed: false },
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(updatedTodo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE - Move task to Trash (soft delete)
router.delete("/:id", async (req, res) => {
    try {
        const trashedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            { isTrashed: true },
            { new: true }
        );

        if (!trashedTodo) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task moved to Trash", todo: trashedTodo });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PATCH - Restore a task from Trash
router.patch("/:id/restore", async (req, res) => {
    try {
        const restoredTodo = await Todo.findOneAndUpdate(
            { _id: req.params.id, isTrashed: true },
            { isTrashed: false },
            { new: true }
        );

        if (!restoredTodo) {
            return res.status(404).json({ message: "Trashed task not found" });
        }

        res.json({ message: "Task restored successfully", todo: restoredTodo });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE - Permanently delete a task
router.delete("/:id/permanent", async (req, res) => {
    try {
        const deletedTodo = await Todo.findOneAndDelete({
            _id: req.params.id,
            isTrashed: true
        });

        if (!deletedTodo) {
            return res.status(404).json({ message: "Trashed task not found" });
        }

        res.json({ message: "Task permanently deleted" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
