"use client";

import { useReceipts } from "@/lib/hooks/useReceipts";
import { useUploadReceipt } from "@/lib/hooks/useReceipts";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { formatCurrency, formatDate, truncate } from "@/lib/utils";
import Link from "next/link";
import toast from "react-hot-toast";
import { Upload, FileImage, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors = {
    completed: { bg: "var(--success-bg)", color: "var(--success-text)" },
    processing: { bg: "var(--warning-bg)", color: "var(--warning-text)" },
    failed: { bg: "var(--error-bg)", color: "var(--error-text)" },
};

function UploadZone() {
    const [preview, setPreview] = useState(null);
    const { mutate: upload, isPending, isSuccess, isError, reset } = useUploadReceipt();

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;
        if (file.type.startsWith("image/")) setPreview(URL.createObjectURL(file));
        upload(file, {
            onSuccess: () => setTimeout(() => { setPreview(null); reset(); }, 3000),
            onError: () => setTimeout(() => { setPreview(null); reset(); }, 3000),
        });
    }, [upload, reset]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/jpeg": [], "image/png": [], "image/webp": [], "application/pdf": [] },
        maxFiles: 1,
        disabled: isPending,
    });

    return (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 14 }}>Upload receipt</h2>
            <div
                {...getRootProps()}
                style={{
                    border: `2px dashed ${isDragActive ? "var(--blue)" : "var(--border-hover)"}`,
                    borderRadius: "var(--radius-lg)",
                    padding: "36px 24px",
                    textAlign: "center",
                    cursor: isPending ? "not-allowed" : "pointer",
                    background: isDragActive ? "var(--blue-light)" : "var(--page-bg)",
                    transition: "all 0.2s ease",
                    opacity: isPending ? 0.7 : 1,
                }}
            >
                <input {...getInputProps()} />
                {isPending ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 40, height: 40, border: "2.5px solid var(--blue)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 500 }}>AI is extracting data...</p>
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>This may take 10–30 seconds</p>
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : isSuccess ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                        <CheckCircle size={40} color="var(--success)" />
                        <p style={{ fontSize: 14, color: "var(--success-text)", fontWeight: 500 }}>Receipt processed successfully</p>
                    </div>
                ) : isError ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                        <AlertCircle size={40} color="var(--error)" />
                        <p style={{ fontSize: 14, color: "var(--error-text)", fontWeight: 500 }}>Processing failed — try again</p>
                    </div>
                ) : preview ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                        <img src={preview} alt="Preview" style={{ maxHeight: 120, borderRadius: "var(--radius-md)", objectFit: "contain" }} />
                        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Ready to process</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 48, height: 48, background: "var(--blue-light)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Upload size={22} color="var(--blue)" />
                        </div>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>
                                {isDragActive ? "Drop your receipt here" : "Drag & drop your receipt"}
                            </p>
                            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                                or click to browse · JPEG, PNG, PDF supported
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ReceiptsPage() {
    const { data: receipts, isLoading } = useReceipts();

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Receipts</h1>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Upload and manage your receipts</p>
            </div>

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