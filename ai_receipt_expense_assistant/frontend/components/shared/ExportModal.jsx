"use client";

import { useState } from "react";
import { downloadExport, getDatePresets } from "@/lib/export";
import toast from "react-hot-toast";
import { X, Download, FileSpreadsheet, FileText } from "lucide-react";

export default function ExportModal({ type, onClose }) {
    const presets = getDatePresets();
    const [format, setFormat] = useState("excel");
    const [fromDate, setFromDate] = useState(presets[0].from);
    const [toDate, setToDate] = useState(presets[0].to);
    const [activePreset, setActivePreset] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handlePreset = (index, preset) => {
        setActivePreset(index);
        setFromDate(preset.from || "");
        setToDate(preset.to || "");
    };

    const handleExport = async () => {
        setIsLoading(true);
        try {
            await downloadExport({ type, format, fromDate, toDate });
            toast.success(`${format === "excel" ? "Excel" : "PDF"} downloaded successfully`);
            onClose();
        } catch (err) {
            toast.error("Export failed — please try again");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                style={{
                    background: "var(--card-bg)",
                    borderRadius: "var(--radius-xl)",
                    width: "100%",
                    maxWidth: 480,
                    border: "1px solid var(--border)",
                    overflow: "hidden",
                }}
            >
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                            Export {type === "expenses" ? "Expenses" : "Receipts"}
                        </h2>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                            Choose format and date range
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, display: "flex", alignItems: "center" }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Format
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                            {[
                                { value: "excel", label: "Excel (.xlsx)", icon: FileSpreadsheet, desc: "3 sheets: summary, expenses, receipts" },
                                { value: "pdf", label: "PDF (.pdf)", icon: FileText, desc: "Formatted report with totals" },
                            ].map(({ value, label, icon: Icon, desc }) => (
                                <button
                                    key={value}
                                    onClick={() => setFormat(value)}
                                    style={{
                                        padding: "12px 14px",
                                        border: `1.5px solid ${format === value ? "var(--blue)" : "var(--border)"}`,
                                        borderRadius: "var(--radius-md)",
                                        background: format === value ? "var(--blue-light)" : "var(--card-bg)",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        transition: "all 0.15s",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                        <Icon size={16} color={format === value ? "var(--blue)" : "var(--text-muted)"} />
                                        <span style={{ fontSize: 13, fontWeight: 500, color: format === value ? "var(--blue-text)" : "var(--text-primary)" }}>
                                            {label}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Date range
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                            {presets.map((preset, i) => (
                                <button
                                    key={i}
                                    onClick={() => handlePreset(i, preset)}
                                    style={{
                                        padding: "4px 12px",
                                        fontSize: 12,
                                        border: `1px solid ${activePreset === i ? "var(--blue)" : "var(--border)"}`,
                                        borderRadius: 999,
                                        background: activePreset === i ? "var(--blue-light)" : "var(--card-bg)",
                                        color: activePreset === i ? "var(--blue-text)" : "var(--text-secondary)",
                                        cursor: "pointer",
                                        fontWeight: activePreset === i ? 500 : 400,
                                        transition: "all 0.15s",
                                    }}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <div>
                                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>From</label>
                                <input
                                    type="date"
                                    value={fromDate || ""}
                                    onChange={(e) => { setFromDate(e.target.value); setActivePreset(-1); }}
                                    style={{
                                        width: "100%",
                                        height: 36,
                                        padding: "0 10px",
                                        border: "1px solid var(--border)",
                                        borderRadius: "var(--radius-md)",
                                        fontSize: 13,
                                        color: "var(--text-primary)",
                                        background: "var(--card-bg)",
                                        outline: "none",
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>To</label>
                                <input
                                    type="date"
                                    value={toDate || ""}
                                    onChange={(e) => { setToDate(e.target.value); setActivePreset(-1); }}
                                    style={{
                                        width: "100%",
                                        height: 36,
                                        padding: "0 10px",
                                        border: "1px solid var(--border)",
                                        borderRadius: "var(--radius-md)",
                                        fontSize: 13,
                                        color: "var(--text-primary)",
                                        background: "var(--card-bg)",
                                        outline: "none",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "8px 16px",
                            fontSize: 13,
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-md)",
                            background: "var(--card-bg)",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isLoading}
                        style={{
                            padding: "8px 20px",
                            fontSize: 13,
                            fontWeight: 500,
                            border: "none",
                            borderRadius: "var(--radius-md)",
                            background: isLoading ? "#93c5fd" : "var(--blue)",
                            color: "white",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            transition: "background 0.15s",
                        }}
                    >
                        {isLoading ? (
                            <>
                                <div style={{ width: 14, height: 14, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Download size={14} />
                                Download {format === "excel" ? "Excel" : "PDF"}
                            </>
                        )}
                    </button>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        </div>
    );
}