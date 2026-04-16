"use client";

import { useState } from "react";
import { useExpenses, useExpenseSummary, useUpdateExpense, useDeleteExpense } from "@/lib/hooks/useExpenses";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, CreditCard, Tag, Edit2, Check, X, Download, Trash2 } from "lucide-react";
import ExportModal from "@/components/shared/ExportModal";

const CATEGORIES = [
    "Food & Dining", "Groceries", "Transportation", "Shopping",
    "Entertainment", "Healthcare", "Utilities", "Other",
];

const statusColors = {
    completed: { bg: "#dbeafe", color: "#1d4ed8" },
};

function SummaryCards({ summary }) {
    const cards = [
        { label: "Total spent", value: formatCurrency(summary?.total_spent || 0, summary?.currency), icon: TrendingUp, iconBg: "#dbeafe", iconColor: "#1d4ed8" },
        { label: "Expenses", value: summary?.expense_count || 0, icon: CreditCard, iconBg: "#ede9fe", iconColor: "#6d28d9" },
        { label: "Categories", value: summary?.by_category?.length || 0, icon: Tag, iconBg: "#dcfce7", iconColor: "#15803d" },
    ];
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
            {cards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
                <div key={label} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "16px 18px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{label}</p>
                        <div style={{ width: 30, height: 30, background: iconBg, borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon size={14} color={iconColor} />
                        </div>
                    </div>
                    <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{value}</p>
                </div>
            ))}
        </div>
    );
}

export default function ExpensesPage() {
    const { data: expenses, isLoading: eLoading } = useExpenses();
    const { data: summary, isLoading: sLoading } = useExpenseSummary();
    const { mutate: updateExpense, isPending } = useUpdateExpense();
    const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpense();
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [showExport, setShowExport] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const startEdit = (expense) => {
        setEditingId(expense.id);
        setEditData({ category: expense.category || "", note: expense.note || "", amount: expense.amount || 0 });
    };

    const saveEdit = (id) => {
        updateExpense({ id, data: editData }, { onSuccess: () => { setEditingId(null); setEditData({}); } });
    };

    const handleDelete = (id) => {
        deleteExpense(id, {
            onSuccess: () => {
                setDeletingId(null);
            },
        });
    };

    const isLoading = eLoading || sLoading;

    const inputStyle = {
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "4px 8px",
        fontSize: 13,
        outline: "none",
        background: "var(--card-bg)",
        color: "var(--text-primary)",
    };

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
                        transition: "all 0.15s",
                        flexShrink: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.color = "var(--blue)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                    <Download size={14} />
                    Export
                </button>
            </div>
            {showExport && <ExportModal type="expenses" onClose={() => setShowExport(false)} />}

            {isLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
                    <div style={{ width: 32, height: 32, border: "2.5px solid var(--blue)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                <>
                    <SummaryCards summary={summary} />

                    <style>{`
                      @media (max-width: 1023px) {
                        .expense-table { display: none !important; }
                        .expense-cards { display: flex !important; }
                      }
                      @media (min-width: 1024px) {
                        .expense-table { display: block !important; }
                        .expense-cards { display: none !important; }
                      }
                    `}</style>

                    <div className="expense-cards" style={{ display: "none", flexDirection: "column", gap: 8 }}>
                        {expenses?.items?.map((expense) => (
                            <div key={expense.id} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "14px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", flex: 1, marginRight: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {expense.merchant_name || "—"}
                                    </p>
                                    {editingId === expense.id ? (
                                        <input
                                            type="number"
                                            value={editData.amount}
                                            onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
                                            style={{
                                                width: 110,
                                                fontSize: 14,
                                                fontWeight: 600,
                                                padding: "4px 8px",
                                                border: "1px solid var(--border)",
                                                borderRadius: 6,
                                                outline: "none",
                                                textAlign: "right",
                                                background: "var(--card-bg)",
                                                color: "var(--text-primary)",
                                            }}
                                        />
                                    ) : (
                                        <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", flexShrink: 0 }}>
                                            {formatCurrency(expense.amount, expense.currency)}
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        {editingId === expense.id ? (
                                            <select
                                                value={editData.category}
                                                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                                style={{ fontSize: 12, padding: "2px 6px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-primary)" }}
                                            >
                                                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        ) : (
                                            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: "var(--blue-light)", color: "var(--blue-text)", fontWeight: 500 }}>
                                                {expense.category || "—"}
                                            </span>
                                        )}
                                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                            {formatDate(expense.expense_date || expense.created_at)}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        {editingId === expense.id ? (
                                            <>
                                                <button
                                                    onClick={() => saveEdit(expense.id)}
                                                    disabled={isPending}
                                                    style={{ padding: "4px 10px", fontSize: 12, background: "var(--success-bg)", color: "var(--success-text)", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500 }}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    style={{ padding: "4px 10px", fontSize: 12, background: "var(--error-bg)", color: "var(--error-text)", border: "none", borderRadius: 6, cursor: "pointer" }}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => startEdit(expense)}
                                                    style={{ padding: "4px 10px", fontSize: 12, background: "var(--page-bg)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(expense.id)}
                                                    style={{ padding: "4px 10px", fontSize: 12, background: "var(--page-bg)", color: "var(--error)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer" }}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="expense-table">
                        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                    <thead>
                                        <tr style={{ background: "var(--page-bg)", borderBottom: "1px solid var(--border)" }}>
                                            {["Merchant", "Date", "Category", "Note", "Amount", ""].map((h) => (
                                                <th key={h} style={{ padding: "10px 16px", textAlign: h === "Amount" ? "right" : "left", fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses?.items?.map((expense) => (
                                            <tr
                                                key={expense.id}
                                                style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.1s" }}
                                                onMouseEnter={(e) => { if (editingId !== expense.id) e.currentTarget.style.background = "var(--page-bg)"; }}
                                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                            >
                                                <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--text-primary)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {expense.merchant_name || "—"}
                                                </td>
                                                <td style={{ padding: "12px 16px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                                                    {formatDate(expense.expense_date || expense.created_at)}
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    {editingId === expense.id ? (
                                                        <select value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} style={{ ...inputStyle, minWidth: 140 }}>
                                                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                                        </select>
                                                    ) : (
                                                        <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: "var(--blue-light)", color: "var(--blue-text)", fontWeight: 500 }}>
                                                            {expense.category || "—"}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>
                                                    {editingId === expense.id ? (
                                                        <input value={editData.note} onChange={(e) => setEditData({ ...editData, note: e.target.value })} placeholder="Add note..." style={{ ...inputStyle, width: "100%" }} />
                                                    ) : (
                                                        <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", display: "block", whiteSpace: "nowrap" }}>
                                                            {expense.note || "—"}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, color: "var(--text-primary)" }}>
                                                    {formatCurrency(expense.amount, expense.currency)}
                                                </td>
                                                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                                    {editingId === expense.id ? (
                                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                                            <button onClick={() => saveEdit(expense.id)} disabled={isPending} style={{ padding: 4, color: "#16a34a", border: "none", background: "none", cursor: "pointer" }}><Check size={16} /></button>
                                                            <button onClick={() => setEditingId(null)} style={{ padding: 4, color: "#dc2626", border: "none", background: "none", cursor: "pointer" }}><X size={16} /></button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                                                            <button onClick={() => startEdit(expense)} style={{ padding: 4, color: "var(--text-muted)", border: "none", background: "none", cursor: "pointer" }}><Edit2 size={14} /></button>
                                                            <button onClick={() => setDeletingId(expense.id)} style={{ padding: 4, color: "var(--error)", border: "none", background: "none", cursor: "pointer" }}><Trash2 size={14} /></button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {deletingId && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
                    <div style={{ background: "var(--card-bg)", borderRadius: "var(--radius-lg)", padding: 24, maxWidth: "24rem", width: "100%" }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Delete expense?</h3>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 32, lineHeight: 1.5 }}>
                            This will permanently delete this expense. The receipt will remain in your records. This action cannot be undone.
                        </p>
                        <div style={{ display: "flex", gap: 16, justifyContent: "flex-end" }}>
                            <button
                                onClick={() => setDeletingId(null)}
                                style={{ padding: "10px 20px", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", background: "var(--page-bg)", border: "1px solid var(--border)", borderRadius: 6, cursor: "pointer", transition: "all 0.15s" }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "var(--border)"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "var(--page-bg)"}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deletingId)}
                                disabled={isDeleting}
                                style={{ padding: "10px 20px", fontSize: 13, fontWeight: 500, color: "white", background: "var(--error)", border: "none", borderRadius: 6, cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.6 : 1, transition: "all 0.15s" }}
                                onMouseEnter={(e) => { if (!isDeleting) e.currentTarget.style.background = "#b91c1c"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--error)"; }}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
