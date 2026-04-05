"use client";

import { useReceipts } from "@/lib/hooks/useReceipts";
import { useExpenseSummary } from "@/lib/hooks/useExpenses";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/authSlice";
import Link from "next/link";
import { formatCurrency, formatDate, truncate } from "@/lib/utils";
import {
    TrendingUp, Receipt, CreditCard, Tag,
    ArrowRight, ChevronRight, FileImage,
} from "lucide-react";

const statusColors = {
    completed: { bg: "var(--success-bg)", color: "var(--success-text)" },
    processing: { bg: "var(--warning-bg)", color: "var(--warning-text)" },
    failed: { bg: "var(--error-bg)", color: "var(--error-text)" },
};

const CHART_COLORS = ["#2563eb", "#7c3aed", "#16a34a", "#d97706", "#dc2626", "#db2777"];

export default function DashboardPage() {
    const user = useSelector(selectUser);
    const { data: receipts, isLoading: rLoading } = useReceipts();
    const { data: summary, isLoading: sLoading } = useExpenseSummary();
    const isLoading = rLoading || sLoading;

    const stats = [
        {
            label: "Total spent",
            value: formatCurrency(summary?.total_spent || 0, summary?.currency),
            icon: TrendingUp,
            iconBg: "#dbeafe",
            iconColor: "#1d4ed8",
        },
        {
            label: "Total receipts",
            value: receipts?.total || 0,
            icon: Receipt,
            iconBg: "#ede9fe",
            iconColor: "#6d28d9",
        },
        {
            label: "Expenses tracked",
            value: summary?.expense_count || 0,
            icon: CreditCard,
            iconBg: "#dcfce7",
            iconColor: "#15803d",
        },
        {
            label: "Categories",
            value: summary?.by_category?.length || 0,
            icon: Tag,
            iconBg: "#fef9c3",
            iconColor: "#854d0e",
        },
    ];

    const recent = receipts?.items?.slice(0, 5) || [];
    const categories = summary?.by_category || [];
    const total = summary?.total_spent || 0;

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
                <div style={{ width: 36, height: 36, border: "2.5px solid var(--blue)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                    Welcome back, {user?.full_name?.split(" ")[0] || "there"} 👋
                </h1>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                    Here&apos;s an overview of your expenses
                </p>
            </div>

            <div className="dashboard-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {stats.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
                    <div key={label} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "18px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{label}</p>
                            <div style={{ width: 34, height: 34, background: iconBg, borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Icon size={16} color={iconColor} />
                            </div>
                        </div>
                        <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{value}</p>
                    </div>
                ))}
            </div>

            <div className="dashboard-bottom-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Recent receipts</h2>
                        <Link href="/receipts" style={{ fontSize: 12, color: "var(--blue)", display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>
                    {recent.length === 0 ? (
                        <div style={{ padding: "40px 20px", textAlign: "center" }}>
                            <FileImage size={32} color="var(--border)" style={{ margin: "0 auto 8px" }} />
                            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No receipts yet</p>
                            <Link href="/receipts" style={{ fontSize: 12, color: "var(--blue)", marginTop: 4, display: "inline-block" }}>
                                Upload your first receipt
                            </Link>
                        </div>
                    ) : (
                        <div>
                            {recent.map((r) => (
                                <Link key={r.id} href={`/receipts/${r.id}`} style={{ display: "flex", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #f8fafc", textDecoration: "none", transition: "background 0.15s" }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--page-bg)"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {truncate(r.merchant_name || r.original_filename, 28)}
                                        </p>
                                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                                            {formatDate(r.receipt_date || r.created_at)}
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 12, flexShrink: 0 }}>
                                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, fontWeight: 500, background: statusColors[r.status]?.bg, color: statusColors[r.status]?.color }}>
                                            {r.status}
                                        </span>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                                            {r.total_amount ? formatCurrency(r.total_amount, r.currency) : "—"}
                                        </span>
                                        <ChevronRight size={14} color="var(--text-muted)" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Spend by category</h2>
                        <Link href="/summary" style={{ fontSize: 12, color: "var(--blue)", fontWeight: 500 }}>Details</Link>
                    </div>
                    {categories.length === 0 ? (
                        <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "32px 0" }}>No data yet</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {categories.map((cat, i) => {
                                const pct = total > 0 ? (cat.total / total) * 100 : 0;
                                return (
                                    <div key={cat.category}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                                                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{cat.category}</span>
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                                                {formatCurrency(cat.total, summary?.currency)}
                                            </span>
                                        </div>
                                        <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length], borderRadius: 3, transition: "width 0.5s ease" }} />
                                        </div>
                                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                                            {cat.count} expense{cat.count !== 1 ? "s" : ""} · {pct.toFixed(1)}%
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}