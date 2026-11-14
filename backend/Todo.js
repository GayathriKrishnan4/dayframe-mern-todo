
const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        category: {
            type: String,
            enum: ["Personal", "Work", "Study"],
            default: "Personal"
        },
        priority: {
            type: String,
            enum: ["High", "Medium", "Low"],
            default: "Medium"
        },
        isTrashed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Todo", todoSchema);
