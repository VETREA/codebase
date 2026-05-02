const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// CREATE TASK (Admin only)
router.post("/", auth, role("admin"), async (req, res) => {
  try {
    const { title, description, deadline, assignedTo, projectId } = req.body;

    if (!title) {
      return res.status(400).json({ msg: "Task title is required" });
    }

    const task = new Task({
      title,
      description,
      deadline,
      assignedTo: assignedTo || null,
      projectId: projectId || null,
      status: "Pending"
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error("Create Task Error:", err);
    res.status(500).json({ msg: "Failed to create task", error: err.message });
  }
});

// GET ALL TASKS
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("projectId", "name");
    res.json(tasks);
  } catch (err) {
    console.error("Get Tasks Error:", err);
    res.status(500).json({ msg: "Failed to fetch tasks", error: err.message });
  }
});

// UPDATE TASK
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    console.error("Update Task Error:", err);
    res.status(500).json({ msg: "Failed to update task", error: err.message });
  }
});

module.exports = router;