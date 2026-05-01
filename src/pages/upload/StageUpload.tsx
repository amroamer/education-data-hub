import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Upload, FileSpreadsheet, X, AlertCircle, CheckCircle2, FileWarning } from "lucide-react";

interface StageUploadProps {
  onFileSelected: (name: string) => void;
  templateLabel: string;
}

export const StageUpload = ({ onFileSelected, templateLabel }: StageUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((name: string, size?: number) => {
    setSelectedFile(name);
    if (size) {
      const kb = size / 1024;
      setFileSize(kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`);
    } else {
      setFileSize("2.4 MB");
    }
  }, []);

  const isValid = selectedFile && (selectedFile.endsWith(".xlsx") || selectedFile.endsWith(".xls") || selectedFile.endsWith(".csv"));

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file.name, file.size);
        }}
        className={cn(
          "border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 cursor-pointer",
          isDragOver && "scale-[1.01]",
          selectedFile ? "border-success" : isDragOver ? "border-accent" : "border-border",
        )}
        style={selectedFile
          ? { background: "hsl(152 55% 97%)", borderColor: "hsl(var(--success))" }
          : isDragOver
          ? { background: "hsl(43 96% 56% / 0.05)", borderColor: "hsl(var(--accent))" }
          : { background: "hsl(220 26% 98.5%)" }}
        onClick={() => !selectedFile && fileRef.current?.click()}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "hsl(152 55% 90%)" }}>
              <FileSpreadsheet className="w-7 h-7" style={{ color: "hsl(var(--success))" }} />
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">{selectedFile}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{fileSize} · Ready to upload</div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-error transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: isDragOver ? "hsl(43 96% 56% / 0.15)" : "hsl(220 20% 93%)" }}>
              <Upload className={cn("w-7 h-7 transition-colors", isDragOver ? "text-accent" : "text-muted-foreground")} />
            </div>
            <div className="font-semibold text-foreground text-sm mb-1">
              {isDragOver ? "Drop to upload" : `Drop your ${templateLabel} file here`}
            </div>
            <div className="text-xs text-muted-foreground mb-4">Supported: .xlsx, .xls, .csv · Max 50 MB</div>
            <button
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
            >
              Browse Files
            </button>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file.name, file.size);
          }}
        />
      </div>

      {/* Requirements panel */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: CheckCircle2, label: "Column Headers", detail: "Row 1 must contain headers matching the template", ok: true },
          { icon: CheckCircle2, label: "One Sheet", detail: "Data must be in the first worksheet tab", ok: true },
          { icon: AlertCircle, label: "No Merged Cells", detail: "Merged cells cause mapping errors — unmerge before upload", ok: false },
        ].map(item => (
          <div key={item.label} className="p-3 rounded-xl border border-border bg-card"
            style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2 mb-1.5">
              <item.icon className={cn("w-3.5 h-3.5 flex-shrink-0", item.ok ? "text-success" : "text-warning")}
                style={{ color: item.ok ? "hsl(var(--success))" : "hsl(36 100% 36%)" }} />
              <span className="text-xs font-semibold text-foreground">{item.label}</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{item.detail}</p>
          </div>
        ))}
      </div>

      {/* Sample preview notice */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border"
        style={{ background: "hsl(220 26% 98.5%)" }}>
        <FileWarning className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className="text-xs text-muted-foreground flex-1">
          For a test run, upload a <strong className="text-foreground">sample file with 50–100 rows</strong> to validate schema before submitting your full dataset.
        </span>
      </div>

      {/* CTA */}
      <div className="flex justify-end">
        <button
          onClick={() => selectedFile && onFileSelected(selectedFile)}
          disabled={!isValid}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
        >
          Upload & Continue
        </button>
      </div>
    </div>
  );
};
