import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type AnalysisResult } from "@shared/schema";
import { cn } from "@/lib/utils";

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  const predictionConfig = {
    normal: {
      label: "Normal",
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-200 dark:border-green-900",
    },
    silent_mi: {
      label: "Silent MI Detected",
      icon: XCircle,
      color: "text-red-600 dark:text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      borderColor: "border-red-200 dark:border-red-900",
    },
    acute_mi: {
      label: "Acute MI Detected",
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      borderColor: "border-orange-200 dark:border-orange-900",
    },
  };

  const config = predictionConfig[result.prediction];
  const Icon = config.icon;
  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <CardHeader className="space-y-6">
        <CardTitle className="text-xl font-medium">Analysis Results</CardTitle>
        
        <div
          className={cn(
            "flex items-center gap-4 p-6 rounded-md border",
            config.bgColor,
            config.borderColor
          )}
        >
          <Icon className={cn("h-10 w-10 flex-shrink-0", config.color)} />
          <div className="flex-1">
            <h3 className={cn("text-2xl font-semibold", config.color)}>
              {config.label}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Confidence: {confidencePercent}%
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Confidence</span>
              <span className="text-sm font-semibold">{confidencePercent}%</span>
            </div>
            <Progress value={confidencePercent} className="h-2" />
          </div>

          {result.details && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Detailed Probabilities
              </h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Normal</span>
                    <span className="text-sm font-semibold">
                      {Math.round(result.details.normalProbability * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={result.details.normalProbability * 100}
                    className="h-1.5"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Silent MI</span>
                    <span className="text-sm font-semibold">
                      {Math.round(result.details.silentMIProbability * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={result.details.silentMIProbability * 100}
                    className="h-1.5"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">Acute MI</span>
                    <span className="text-sm font-semibold">
                      {Math.round(result.details.acuteMIProbability * 100)}%
                    </span>
                  </div>
                  <Progress
                    value={result.details.acuteMIProbability * 100}
                    className="h-1.5"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Analysis ID</span>
            <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
              {result.id}
            </code>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Timestamp</span>
            <span className="text-xs">
              {new Date(result.timestamp).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="pt-4">
          <Badge variant="outline" className="text-xs">
            For Research/Educational Use Only
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
