import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { spawn } from "child_process";
import { unlink } from "fs/promises";
import path from "path";
import os from "os";
import { patientInfoSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

const upload = multer({
  dest: os.tmpdir(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (_req, file, cb) => {
    const allowedExtensions = [".dat", ".hea", ".csv"];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only .dat, .hea, and .csv files are allowed."));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // ECG Analysis endpoint
  app.post("/api/analyze", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded. Please upload an ECG file.",
        });
      }

      if (!req.body.patientInfo) {
        await unlink(req.file.path);
        return res.status(400).json({
          message: "Patient information is required.",
        });
      }

      // Parse and validate patient information
      let patientInfo;
      try {
        const parsedInfo = JSON.parse(req.body.patientInfo);
        const validation = patientInfoSchema.safeParse(parsedInfo);
        
        if (!validation.success) {
          await unlink(req.file.path);
          const validationError = fromError(validation.error);
          return res.status(400).json({
            message: "Invalid patient information",
            error: validationError.toString(),
          });
        }
        
        patientInfo = validation.data;
      } catch (err) {
        await unlink(req.file.path);
        return res.status(400).json({
          message: "Failed to parse patient information",
        });
      }
      const filePath = req.file.path;

      // Call Python script for ECG analysis
      const pythonProcess = spawn("python", [
        path.join(process.cwd(), "server", "analyze_ecg.py"),
        filePath,
        JSON.stringify(patientInfo),
      ]);

      let outputData = "";
      let errorData = "";

      pythonProcess.stdout.on("data", (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorData += data.toString();
      });

      pythonProcess.on("close", async (code) => {
        // Clean up uploaded file
        try {
          await unlink(filePath);
        } catch (err) {
          console.error("Error deleting temp file:", err);
        }

        if (code !== 0) {
          console.error("Python script error:", errorData);
          return res.status(500).json({
            message: "ECG analysis failed. Please try again with a valid ECG file.",
            error: errorData,
          });
        }

        try {
          const result = JSON.parse(outputData);
          
          if (result.error) {
            return res.status(500).json({
              message: result.message || "Analysis failed",
              error: result.error,
            });
          }

          res.json(result);
        } catch (err) {
          console.error("Error parsing Python output:", err, outputData);
          return res.status(500).json({
            message: "Failed to process analysis results.",
          });
        }
      });
    } catch (error) {
      console.error("Analysis error:", error);
      
      // Clean up file if error occurs
      if (req.file) {
        try {
          await unlink(req.file.path);
        } catch (err) {
          console.error("Error deleting temp file:", err);
        }
      }

      res.status(500).json({
        message: error instanceof Error ? error.message : "Analysis failed",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
