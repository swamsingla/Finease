const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const classifyDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path; // Get the file path from multer
    // console.log("Classifying document:", filePath);

    // Spawn a Python process
    const pythonProcess = spawn("python3", [
      path.join(__dirname, "../scripts/classify.py"),
      filePath, // Pass the absolute file path to the script
    ]);

    let result = "";
    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python Error: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        // Delete the file even if the script fails
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
        return res.status(500).json({ error: "Error in classification script" });
      }

      try {
        const parsedResult = JSON.parse(result.trim()); // Ensure proper JSON format

        const classification = parsedResult.classification || "Unknown";
        const dateInfo = parsedResult.date || "No Date Found";

        // Send the response to the client
        res.json({ classification: classification.trim(), date: dateInfo.trim() });

        // Delete the file after sending the response
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
          // else console.log("File deleted successfully:", filePath);
        });
      } catch (err) {
        console.error("Error parsing Python output:", err);

        // Delete the file if there's an error parsing the output
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
        });

        res.status(500).json({ error: "Invalid response from classification script" });
      }
    });
  } catch (error) {
    console.error("Error running classification:", error);

    // Delete the file if there's an error in the try block
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { classifyDocument };