require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

const User = require("./models/User");
const bcrypt = require("bcryptjs");

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected successfully");
    await seedAdmin();
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err);
    process.exit(1);
  });

// Seed Admin User
async function seedAdmin() {
  try {
    const adminEmail = "admin@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("123456", 10);
      const admin = new User({
        name: "Default Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      });
      await admin.save();
      console.log("👤 Default admin user created: admin@gmail.com / 123456");
    }
  } catch (err) {
    console.error("Error seeding admin user:", err);
  }
}

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/project"));
app.use("/api/tasks", require("./routes/task"));

app.get("/", (req, res) => res.send("Team Task Manager API Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));