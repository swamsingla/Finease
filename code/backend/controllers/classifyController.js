const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

// Function to classify document type and extract date
const classifyDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;

    // ✅ Spawn a Python process
    const pythonProcess = spawn("python3", [
      path.join(__dirname, "../scripts/classify.py"),
      filePath, // Pass the file path to the script
    ]);

    let result = "";
    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file:", err);
      });

      if (code !== 0) {
        return res.status(500).json({ error: "Error in classification script" });
      }

      // Split classification and date
      const [classification, dateInfo] = result.trim().split("| Date: ");
      
      res.json({ classification: classification.trim(), date: dateInfo.trim() });
    });
  } catch (error) {
    console.error("Error running classification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { classifyDocument };
