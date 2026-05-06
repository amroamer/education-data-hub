import { useState, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import { Stage, MappedColumn, ValidationResults, ParsedFileData } from "./upload/types";
import { DATA_TEMPLATES } from "./upload/data";
import { StageProgress } from "./upload/StageProgress";
import { StageSelect } from "./upload/StageSelect";
import { StageUpload } from "./upload/StageUpload";
import { StageMapping } from "./upload/StageMapping";
import { StageValidating } from "./upload/StageValidating";
import { StageResults } from "./upload/StageResults";

const UploadPortal = () => {
  const [stage, setStage] = useState<Stage>("select");
  const [selectedTemplate, setSelectedTemplate] = useState("enrollment");
  const [fileName, setFileName] = useState("");
  const [parsedFileData, setParsedFileData] = useState<ParsedFileData | null>(null);
  const [mapping, setMapping] = useState<MappedColumn[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);

  const template = DATA_TEMPLATES.find(t => t.id === selectedTemplate)!;

  const reset = useCallback(() => {
    setStage("select");
    setFileName("");
    setParsedFileData(null);
    setMapping([]);
    setValidationResults(null);
  }, []);

  return (
    <div className="max-w-5xl space-y-0">
      {/* Page header */}
      <div className="page-header flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl text-foreground">Data Upload & Validation Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submit structured data via Excel upload with automated schema validation, column mapping, and data quality reporting
          </p>
        </div>
        {stage !== "select" && (
          <button
            onClick={reset}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> New Upload
          </button>
        )}
      </div>

      {/* Stage progress tracker */}
      <StageProgress stage={stage} />

      {/* Stage panels */}
      {stage === "select" && (
        <StageSelect
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
          onNext={() => setStage("upload")}
        />
      )}

      {stage === "upload" && (
        <StageUpload
          templateLabel={template.label}
          onFileSelected={(name, parsedData) => {
            setFileName(name);
            setParsedFileData(parsedData);
            setStage("mapping");
          }}
        />
      )}

      {stage === "mapping" && (
        <StageMapping
          template={template}
          fileName={fileName}
          parsedFileData={parsedFileData}
          onRunValidation={(m) => {
            setMapping(m);
            setStage("validating");
          }}
          onBack={() => {
            setParsedFileData(null);
            setFileName("");
            setStage("upload");
          }}
        />
      )}

      {stage === "validating" && (
        <StageValidating
          fileName={fileName}
          templateLabel={template.label}
          template={template}
          mapping={mapping}
          totalRows={parsedFileData?.totalRows ?? 1284}
          onComplete={(results) => {
            setValidationResults(results);
            setStage("results");
          }}
        />
      )}

      {stage === "results" && (
        <StageResults
          fileName={fileName}
          templateLabel={template.label}
          validationResults={validationResults}
          onReset={reset}
        />
      )}
    </div>
  );
};

export default UploadPortal;
