"use client";

import { useReceipts, useUploadReceipt, useBatchUpload, useBatchStatus } from "@/lib/hooks/useReceipts";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { formatCurrency, formatDate, truncate } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";
import { Upload, FileImage, CheckCircle, AlertCircle, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import ExportModal from "@/components/shared/ExportModal";


const statusColors = {
    completed: { bg: "var(--success-bg)", color: "var(--success-text)" },
    processing: { bg: "var(--warning-bg)", color: "var(--warning-text)" },
    queued: { bg: "#f1f5f9", color: "#475569" },
    failed: { bg: "var(--error-bg)", color: "var(--error-text)" },
};

function BatchProgress({ batchId, onComplete }) {
    const { data: batch } = useBatchStatus(batchId);
    const queryClient = useQueryClient();

    if (!batch) return null;

    if (batch.status === "completed" && onComplete) {
        queryClient.invalidateQueries({ queryKey: ["receipts"] });
        queryClient.invalidateQueries({ queryKey: ["expenses"] });
        onComplete();
    }

    const progress = batch.total_count > 0
        ? Math.round(((batch.completed_count + batch.failed_count) / batch.total_count) * 100)
        : 0;

    return (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                    Processing batch — {batch.completed_count + batch.failed_count} of {batch.total_count} done
                </p>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{progress}%</span>
            </div>
            <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "var(--blue)", borderRadius: 3, transition: "width 0.5s ease" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {batch.receipts?.map((r) => (
                    <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 8 }}>
                            {r.filename}
                        </span>
                        <span style={{ padding: "1px 8px", borderRadius: 999, fontWeight: 500, background: statusColors[r.status]?.bg, color: statusColors[r.status]?.color, flexShrink: 0 }}>
                            {r.status}
                        </span>
                    </div>
                ))}
            </div>
            {batch.status === "completed" && (
                <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--success-bg)", borderRadius: "var(--radius-md)", fontSize: 12, color: "var(--success-text)", fontWeight: 500 }}>
                    Batch complete — {batch.completed_count} succeeded, {batch.failed_count} failed
                </div>
            )}
        </div>
    );
}

function UploadZone() {
    const [batchId, setBatchId] = useState(null);
    const [queuedFiles, setQueuedFiles] = useState([]);
    const { mutate: uploadBatch, isPending } = useBatchUpload();

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            toast.error("Some files were rejected — max 3 files, JPEG/PNG/PDF only, 10MB limit each");
        }
        if (acceptedFiles.length > 0) {
            setQueuedFiles(acceptedFiles);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/jpeg": [], "image/png": [], "image/webp": [], "application/pdf": [] },
        maxFiles: 3,
        maxSize: 10 * 1024 * 1024,
        disabled: isPending || !!batchId,
    });

    const handleUpload = () => {
        if (queuedFiles.length === 0) return;
        uploadBatch(queuedFiles, {
            onSuccess: (data) => {
                setBatchId(data.batch_id);
                setQueuedFiles([]);
                toast.success(`Processing ${data.total_count} receipt(s)...`);
            },
        });
    };

    const clearQueue = () => setQueuedFiles([]);

    return (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Upload receipts</h2>
                <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--page-bg)", padding: "2px 8px", borderRadius: 999, border: "1px solid var(--border)" }}>
                    Max 3 per batch
                </span>
            </div>

            {batchId ? (
                <BatchProgress
                    batchId={batchId}
                    onComplete={() => setTimeout(() => setBatchId(null), 3000)}
                />
            ) : (
                <>
                    <div
                        {...getRootProps()}
                        style={{
                            border: `2px dashed ${isDragActive ? "var(--blue)" : "var(--border-hover)"}`,
                            borderRadius: "var(--radius-lg)",
                            padding: "28px 24px",
                            textAlign: "center",
                            cursor: isPending ? "not-allowed" : "pointer",
                            background: isDragActive ? "var(--blue-light)" : "var(--page-bg)",
                            transition: "all 0.2s ease",
                        }}
                    >
                        <input {...getInputProps()} />
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 44, height: 44, background: "var(--blue-light)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Upload size={20} color="var(--blue)" />
                            </div>
                            <div>
                                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>
                                    {isDragActive ? "Drop receipts here" : "Drag & drop receipts"}
                                </p>
                                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                                    or click to browse · up to 3 files · JPEG, PNG, PDF · 10MB each
                                </p>
                            </div>
                        </div>
                    </div>

                    {queuedFiles.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>
                                    {queuedFiles.length} file{queuedFiles.length > 1 ? "s" : ""} ready
                                </p>
                                <button onClick={clearQueue} style={{ fontSize: 11, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>
                                    Clear all
                                </button>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                                {queuedFiles.map((file, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--page-bg)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                                        <FileImage size={14} color="var(--text-muted)" />
                                        <span style={{ fontSize: 12, color: "var(--text-secondary)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {file.name}
                                        </span>
                                        <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
                                            {(file.size / 1024 / 1024).toFixed(1)}MB
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleUpload}
                                disabled={isPending}
                                style={{
                                    width: "100%",
                                    height: 38,
                                    background: "var(--blue)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "var(--radius-md)",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                }}
                            >
                                <Upload size={14} />
                                Process {queuedFiles.length} receipt{queuedFiles.length > 1 ? "s" : ""}
                            </button>
                            <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 6 }}>
                                Estimated time: ~{queuedFiles.length * 25} seconds
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default function ReceiptsPage() {
    const { data: receipts, isLoading } = useReceipts();
    const [showExport, setShowExport] = useState(false);


    return (
        <div>
            <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Expenses</h1>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Track and categorise your spending</p>
                </div>
                <button
                    onClick={() => setShowExport(true)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "8px 16px",
                        fontSize: 13,
                        fontWeight: 500,
                        background: "var(--card-bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        // transition: "all 0.15s",
                        flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.color = "var(--blue)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                    <Download size={14} />
                    Export
                </button>
            </div>

            {showExport && <ExportModal type="receipts" onClose={() => setShowExport(false)} />}

            <UploadZone />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                    All receipts
                    {receipts?.total > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text-muted)", marginLeft: 6 }}>
                            ({receipts.total})
                        </span>
                    )}
                </h2>
            </div>

            {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                    <div style={{ width: 32, height: 32, border: "2.5px solid var(--blue)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : receipts?.items?.length === 0 ? (
                <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "48px 24px", textAlign: "center" }}>
                    <FileImage size={40} color="var(--border)" style={{ margin: "0 auto 12px" }} />
                    <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No receipts yet — upload one above</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {receipts?.items?.map((r) => (
                        <Link
                            key={r.id}
                            href={`/receipts/${r.id}`}
                            style={{
                                background: "var(--card-bg)",
                                border: "1px solid var(--border)",
                                borderRadius: "var(--radius-lg)",
                                padding: "14px 18px",
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                                textDecoration: "none",
                                transition: "all 0.15s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                        >
                            <div style={{ width: 38, height: 38, background: "var(--page-bg)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <FileImage size={18} color="var(--text-muted)" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {truncate(r.merchant_name || r.original_filename, 45)}
                                </p>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, fontWeight: 500, background: statusColors[r.status]?.bg, color: statusColors[r.status]?.color }}>
                                        {r.status}
                                    </span>
                                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                        {formatDate(r.receipt_date || r.created_at)}
                                    </span>
                                    {r.category && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>· {r.category}</span>}
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                                    {r.total_amount ? formatCurrency(r.total_amount, r.currency) : "—"}
                                </span>
                                <ChevronRight size={16} color="var(--text-muted)" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}