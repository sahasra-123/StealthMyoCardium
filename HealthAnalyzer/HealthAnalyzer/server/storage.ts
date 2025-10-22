import { type AnalysisResult } from "@shared/schema";

// Storage interface for ECG analysis results
// Currently using in-memory storage for demonstration
// In production, this would use a database to store analysis history

export interface IStorage {
  saveAnalysis(result: AnalysisResult): Promise<AnalysisResult>;
  getAnalysis(id: string): Promise<AnalysisResult | undefined>;
  getAllAnalyses(): Promise<AnalysisResult[]>;
}

export class MemStorage implements IStorage {
  private analyses: Map<string, AnalysisResult>;

  constructor() {
    this.analyses = new Map();
  }

  async saveAnalysis(result: AnalysisResult): Promise<AnalysisResult> {
    this.analyses.set(result.id, result);
    return result;
  }

  async getAnalysis(id: string): Promise<AnalysisResult | undefined> {
    return this.analyses.get(id);
  }

  async getAllAnalyses(): Promise<AnalysisResult[]> {
    return Array.from(this.analyses.values());
  }
}

export const storage = new MemStorage();
