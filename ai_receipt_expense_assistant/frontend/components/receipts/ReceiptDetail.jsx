"use client";

import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { ArrowLeft, FileImage, Calendar, Tag, Cpu, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeleteReceipt } from "@/lib/hooks/useReceipts";
import { useState } from "react";

const statusStyles = {
    completed: "bg-green-100 text-green-700",
    processing: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-700",
};

export default function ReceiptDetail({ receipt }) {
    const router = useRouter();
    const { mutate: deleteReceipt, isPending } = useDeleteReceipt();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = async () => {
        deleteReceipt(receipt.id, {
            onSuccess: () => {
                router.push("/receipts");
            },
        });
    };

    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            <div className="flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href="/receipts"
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {receipt.merchant_name || receipt.original_filename}
                        </h1>
                        <p className="text-sm text-gray-400">
                            Uploaded {formatDateTime(receipt.created_at)}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700"
                    title="Delete receipt"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-sm" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, letterSpacing: "-0.02em" }}>Delete receipt?</h3>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 32, lineHeight: 1.6 }}>
                            This will permanently delete this receipt and its associated expense. This action cannot be undone.
                        </p>
                        <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
                            <button
                                onClick={() => setShowDeleteDialog(false)}
                                style={{ padding: "10px 20px", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", background: "var(--page-bg)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", transition: "all 0.15s" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "var(--border)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "var(--page-bg)"}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isPending}
                                style={{ padding: "10px 20px", fontSize: 13, fontWeight: 500, color: "white", background: "var(--error)", border: "none", borderRadius: 6, cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.6 : 1, transition: "all 0.15s" }}
                                onMouseEnter={(e) => { if (!isPending) e.currentTarget.style.background = "#b91c1c"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--error)"; }}
                            >
                                {isPending ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusStyles[receipt.status]}`}>
                        {receipt.status}
                    </span>
                    {receipt.total_amount && (
                        <span className="text-2xl font-bold text-gray-900">
                            {formatCurrency(receipt.total_amount, receipt.currency)}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Calendar size={16} className="text-gray-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Date</p>
                            <p className="text-sm font-medium text-gray-900">
                                {formatDate(receipt.receipt_date) || "—"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Tag size={16} className="text-gray-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Category</p>
                            <p className="text-sm font-medium text-gray-900">
                                {receipt.category || "—"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileImage size={16} className="text-gray-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">File</p>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                                {receipt.original_filename}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Cpu size={16} className="text-gray-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">AI model</p>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                                {receipt.model_used?.split("/")[1]?.split(":")[0] || "—"}
                            </p>
                        </div>
                    </div>
                </div>

                {receipt.error_message && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-sm text-red-600">{receipt.error_message}</p>
                    </div>
                )}
            </div>

            {receipt.line_items && receipt.line_items.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Line items</h2>
                    <div className="flex flex-col gap-2">
                        {receipt.line_items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                            >
                                <div>
                                    <p className="text-sm text-gray-900">{item.name}</p>
                                    {item.quantity && (
                                        <p className="text-xs text-gray-400">
                                            Qty: {item.quantity}
                                        </p>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {item.total
                                        ? formatCurrency(item.total, receipt.currency)
                                        : "—"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}