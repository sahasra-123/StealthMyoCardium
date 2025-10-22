import { useState } from "react";
import { Activity, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PatientForm } from "@/components/patient-form";
import { ECGUpload } from "@/components/ecg-upload";
import { AnalysisResults } from "@/components/analysis-results";
import { ThemeToggle } from "@/components/theme-toggle";
import { type PatientInfo, type AnalysisResult } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type Step = "patient" | "upload" | "results";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("patient");
  const [patientData, setPatientData] = useState<PatientInfo | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const analysisMutation = useMutation({
    mutationFn: async (data: { patientInfo: PatientInfo; file: File }) => {
      const formData = new FormData();
      formData.append("file", data.file);
      formData.append("patientInfo", JSON.stringify(data.patientInfo));

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Analysis failed");
      }

      return response.json();
    },
    onSuccess: (result: AnalysisResult) => {
      setAnalysisResult(result);
      setCurrentStep("results");
    },
  });

  const handlePatientSubmit = (data: PatientInfo) => {
    setPatientData(data);
    setCurrentStep("upload");
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleAnalyze = () => {
    if (patientData && selectedFile) {
      analysisMutation.mutate({
        patientInfo: patientData,
        file: selectedFile,
      });
    }
  };

  const handleReset = () => {
    setCurrentStep("patient");
    setPatientData(null);
    setSelectedFile(null);
    setAnalysisResult(null);
    analysisMutation.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Silent MI Detection System</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-2">ECG Analysis</h2>
          <p className="text-muted-foreground">
            Advanced machine learning-based detection of Silent Myocardial Infarction
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Patient Information</span>
                  {currentStep !== "patient" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep("patient")}
                      disabled={analysisMutation.isPending}
                      data-testid="button-edit-patient"
                    >
                      Edit
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  Enter patient demographic and vital information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentStep === "patient" ? (
                  <PatientForm
                    onSubmit={handlePatientSubmit}
                    disabled={analysisMutation.isPending}
                  />
                ) : (
                  patientData && (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Age</span>
                        <span className="font-medium">{patientData.age} years</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Gender</span>
                        <span className="font-medium capitalize">{patientData.gender}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Height</span>
                        <span className="font-medium">{patientData.height} cm</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Weight</span>
                        <span className="font-medium">{patientData.weight} kg</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Blood Pressure</span>
                        <span className="font-medium">
                          {patientData.systolicBP}/{patientData.diastolicBP} mmHg
                        </span>
                      </div>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {currentStep !== "patient" && (
              <Card>
                <CardHeader>
                  <CardTitle>ECG Upload</CardTitle>
                  <CardDescription>
                    Upload ECG recording file for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ECGUpload
                    onFileSelect={handleFileSelect}
                    disabled={analysisMutation.isPending}
                  />

                  {selectedFile && currentStep === "upload" && (
                    <Button
                      onClick={handleAnalyze}
                      className="w-full"
                      disabled={analysisMutation.isPending}
                      data-testid="button-analyze"
                    >
                      {analysisMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing ECG...
                        </>
                      ) : (
                        "Analyze ECG"
                      )}
                    </Button>
                  )}

                  {analysisMutation.isError && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {analysisMutation.error instanceof Error
                          ? analysisMutation.error.message
                          : "Analysis failed. Please try again."}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {currentStep === "results" && analysisResult && (
              <div className="space-y-4">
                <AnalysisResults result={analysisResult} />
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full"
                  data-testid="button-new-analysis"
                >
                  New Analysis
                </Button>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            This system is intended for research and educational purposes only.
            Not for clinical diagnosis.
          </p>
          <p className="mt-2">Silent MI Detection System v1.0</p>
        </footer>
      </main>
    </div>
  );
}
