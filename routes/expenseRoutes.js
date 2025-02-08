const express = require("express");
const router = express.Router();
const { Expense } = require("../models/expense");

// Add an expense
router.post("/add", async (req, res) => {
  try {
    const { name, amount, category, description, user } = req.body;
    const expense = new Expense({ name, amount, category, description, user });
    await expense.save();
    console.log(expense);
    res.status(201).json({ message: "Expense added successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Edit Expense
router.post("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the expense ID from the URL params
    const { name, amount, category, description, user } = req.body; // Get new data from the request body

    // Validate that necessary fields are present
    if (!name || !amount || !category || !user) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find the expense by ID and update it
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { name, amount, category, description, user },
      { new: true } // Return the updated document
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found!" });
    }

    // Respond with the updated expense
    res.status(200).json({
      message: "Expense updated successfully!",
      expense: updatedExpense
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the id is provided
    if (!id) {
      return res.status(404).json({ message: "Id Not Found!" }); // Return after sending the response
    }

    // Check if the expense exists
    const idexisit = await Expense.findById(id);
    if (!idexisit) {
      return res.status(400).json({ message: "Expense Not Found!" }); // Return after sending the response
    }

    // Proceed with deletion
    await Expense.findByIdAndDelete(id);

    // Send success response
    return res.status(200).json({ message: "Expense deleted successfully!" });
  } catch (error) {
    // Handle errors
    console.error("Error deleting expense:", error);
    if (!res.headersSent) {
      // Check if headers have already been sent
      return res.status(500).json({ error: error.message });
    }
  }
});


module.exports = router;
