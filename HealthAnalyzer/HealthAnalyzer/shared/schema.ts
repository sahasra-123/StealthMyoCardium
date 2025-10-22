import { z } from "zod";

// Patient Information Schema
export const patientInfoSchema = z.object({
  age: z.number().min(1).max(120),
  gender: z.enum(["male", "female", "other"]),
  height: z.number().min(50).max(300), // cm
  weight: z.number().min(10).max(500), // kg
  systolicBP: z.number().min(50).max(300), // mmHg
  diastolicBP: z.number().min(30).max(200), // mmHg
});

export type PatientInfo = z.infer<typeof patientInfoSchema>;

// Analysis Result Schema
export const analysisResultSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  patientInfo: patientInfoSchema,
  prediction: z.enum(["normal", "silent_mi", "acute_mi"]),
  confidence: z.number().min(0).max(1),
  details: z.object({
    normalProbability: z.number(),
    silentMIProbability: z.number(),
    acuteMIProbability: z.number(),
  }).optional(),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

// Analysis Request Schema
export const analysisRequestSchema = z.object({
  patientInfo: patientInfoSchema,
  fileName: z.string(),
});

export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
