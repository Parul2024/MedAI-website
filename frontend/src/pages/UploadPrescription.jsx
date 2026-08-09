import { useState, useRef } from "react";
import { UploadCloud, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import MedicineResultCard from "../components/MedicineResultCard";
import ReminderModal from "../components/ReminderModal";

const UploadPrescription = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reminderMed, setReminderMed] = useState(null);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Please choose a prescription image first");
    setLoading(true);
    const formData = new FormData();
    formData.append("prescriptionImage", file);
    try {
      const { data } = await api.post("/prescriptions/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      if (data.status === "done" && data.medicines.length === 0) {
        toast("Scanned, but no known medicines were matched.", { icon: "ℹ️" });
      } else {
        toast.success("Prescription analyzed!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold text-pine-900">Scan a Prescription</h1>
        <p className="mt-2 text-sm text-pine-600">
          Upload a photo of a doctor's prescription. MedAI reads the handwriting/print and looks up each
          medicine's dosage and use.
        </p>
      </div>

      {!preview ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
          className="card flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-pine-300 py-16 text-center transition hover:border-pine-500 hover:bg-pine-50"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-pine-100 text-pine-700">
            <UploadCloud size={26} />
          </span>
          <p className="font-medium text-pine-900">Drag & drop a prescription image here</p>
          <p className="text-sm text-pine-500">or click to browse (JPG, PNG, WEBP)</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="card mb-6">
          <div className="flex items-start justify-between">
            <img src={preview} alt="Prescription preview" className="max-h-72 rounded-xl object-contain" />
            <button onClick={reset} className="rounded-full p-1.5 text-pine-500 hover:bg-pine-100">
              <X size={18} />
            </button>
          </div>
          {!result && (
            <button onClick={handleUpload} disabled={loading} className="btn-primary mt-6 w-full">
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Reading prescription...
                </>
              ) : (
                "Analyze Prescription"
              )}
            </button>
          )}
        </div>
      )}

      {result && (
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold text-pine-900">
            {result.medicines.length} medicine{result.medicines.length !== 1 && "s"} detected
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {result.medicines.map((med, i) => (
              <MedicineResultCard key={i} med={med} onSetReminder={setReminderMed} />
            ))}
          </div>
          {result.rawText && (
            <details className="card mt-6">
              <summary className="cursor-pointer text-sm font-semibold text-pine-700">
                Show raw OCR text (for troubleshooting)
              </summary>
              <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-pine-50 p-4 text-xs text-pine-800">
                {result.rawText}
              </pre>
            </details>
          )}

          <button onClick={reset} className="btn-secondary mt-6">
            Scan another prescription
          </button>
        </div>
      )}

      {reminderMed && (
        <ReminderModal
          med={reminderMed}
          prescriptionId={result?._id}
          onClose={() => setReminderMed(null)}
        />
      )}
    </div>
  );
};

export default UploadPrescription;
