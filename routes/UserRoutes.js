const express = require("express");
const router = express.Router();
const { User } = require("../models/expense");
const bcrypt = require("bcrypt"); // Import bcrypt for hashing

// Add a user
router.post("/addUser", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    // Hash the password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10
    } catch (hashError) {
      return res.status(500).json({ message: "Error hashing password." });
    }

    // Create and save the user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Respond with non-sensitive user info
    res.status(201).json({ 
      message: "User added successfully!", 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Update User
router.post("/updateUser", async (req, res) => {
  try {
    const { email, password, newname, newemail, newpassword } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    if (newemail && !emailRegex.test(newemail)) {
      return res.status(400).json({ message: "New email is in invalid format!" });
    }

    // Find existing user
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Verify the password
    const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    // Prepare updates
    const updates = {};
    if (newname) updates.name = newname;
    if (newemail) updates.email = newemail;
    if (newpassword) {
      updates.password = await bcrypt.hash(newpassword, 10); // Hash new password
    }

    // Update user
    await User.findByIdAndUpdate(existingUser._id, updates, { new: true });

    // Respond with success message
    res.status(200).json({ message: "User updated successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
