const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// CREATE PROJECT (Admin only)
router.post("/", auth, role("admin"), async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "Project name is required" });
    }

    const project = new Project({
      name,
      createdBy: req.user.id,
      members: members || []
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error("Create Project Error:", err);
    res.status(500).json({ msg: "Failed to create project", error: err.message });
  }
});

// GET ALL PROJECTS
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find().populate("members", "name email");
    res.json(projects);
  } catch (err) {
    console.error("Get Projects Error:", err);
    res.status(500).json({ msg: "Failed to fetch projects", error: err.message });
  }
});

module.exports = router;