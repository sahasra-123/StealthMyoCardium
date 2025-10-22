import { useState, useCallback } from "react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ECGUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function ECGUpload({ onFileSelect, disabled = false }: ECGUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback(
    (selectedFile: File | null) => {
      if (!selectedFile) return;

      const validExtensions = [".dat", ".hea", ".csv"];
      const fileExt = selectedFile.name.substring(
        selectedFile.name.lastIndexOf(".")
      );

      if (!validExtensions.includes(fileExt.toLowerCase())) {
        alert("Please upload a valid ECG file (.dat, .hea, or .csv)");
        return;
      }

      setFile(selectedFile);
      onFileSelect(selectedFile);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileChange(droppedFile);
      }
    },
    [handleFileChange, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileChange(selectedFile);
      }
    },
    [handleFileChange]
  );

  const removeFile = useCallback(() => {
    setFile(null);
  }, []);

  return (
    <div className="space-y-4">
      {!file ? (
        <div
          className={cn(
            "relative min-h-64 border-2 border-dashed rounded-md transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          data-testid="dropzone-ecg-upload"
        >
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            onChange={handleInputChange}
            accept=".dat,.hea,.csv"
            disabled={disabled}
            data-testid="input-file-upload"
          />
          <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-base font-medium text-foreground mb-2">
              Drop ECG file here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supported formats: .dat, .hea, .csv
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              PTB-XL WFDB format or CSV with 12-lead ECG data
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-md p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <FileText className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-foreground truncate">
                  {file.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              disabled={disabled}
              data-testid="button-remove-file"
              aria-label="Remove file"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
