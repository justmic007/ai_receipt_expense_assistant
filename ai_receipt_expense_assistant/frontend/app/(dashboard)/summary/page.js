"use client";

import { useExpenseSummary } from "@/lib/hooks/useExpenses";
import { useReceipts } from "@/lib/hooks/useReceipts";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, CreditCard, Tag, Receipt } from "lucide-react";
import dynamic from "next/dynamic";

const DonutChart = dynamic(() => import("@/components/expenses/DonutChart"), { ssr: false });
const SpendBarChart = dynamic(() => import("@/components/expenses/SpendBarChart"), { ssr: false });

export default function SummaryPage() {
    const { data: summary, isLoading: sLoading } = useExpenseSummary();
    const { data: receipts, isLoading: rLoading } = useReceipts();
    const isLoading = sLoading || rLoading;

    const completed = receipts?.items?.filter((r) => r.status === "completed").length || 0;
    const failed = receipts?.items?.filter((r) => r.status === "failed").length || 0;
    const total = summary?.total_spent || 0;
    const categories = summary?.by_category || [];

    const statCards = [
        { label: "Total spent", value: formatCurrency(total, summary?.currency), icon: TrendingUp, iconBg: "#dbeafe", iconColor: "#1d4ed8" },
        { label: "Total expenses", value: summary?.expense_count || 0, icon: CreditCard, iconBg: "#ede9fe", iconColor: "#6d28d9" },
        { label: "Categories", value: categories.length, icon: Tag, iconBg: "#dcfce7", iconColor: "#15803d" },
        { label: "Avg per receipt", value: completed > 0 ? formatCurrency(total / completed, summary?.currency) : "—", icon: Receipt, iconBg: "#fef9c3", iconColor: "#854d0e" },
    ];

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
                <div style={{ width: 32, height: 32, border: "2.5px solid var(--blue)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Summary</h1>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Your complete spending overview</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                {statCards.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
                    <div key={label} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "18px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{label}</p>
                            <div style={{ width: 34, height: 34, background: iconBg, borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Icon size={16} color={iconColor} />
                            </div>
                        </div>
                        <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{value}</p>
                    </div>
                ))}
            </div>

            <div className="summary-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px 24px", width: "100%" }}>
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Category breakdown</h2>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Spending distribution by category</p>
                    <div style={{ width: "100%", height: 260 }}>
                        <DonutChart categories={categories} currency={summary?.currency} />
                    </div>
                </div>

                <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px 24px", width: "100%" }}>
                    <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>Top categories</h2>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Highest spending areas</p>
                    <div style={{ width: "100%", height: 260 }}>
                        <SpendBarChart categories={categories} currency={summary?.currency} />
                    </div>
                </div>
            </div>

            <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px 24px" }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 20 }}>Receipt stats</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {[
                        { label: "Total uploaded", value: receipts?.total || 0, color: "var(--text-primary)" },
                        { label: "Successfully processed", value: completed, color: "var(--success)" },
                        { label: "Failed", value: failed, color: "var(--error)" },
                        { label: "Success rate", value: receipts?.total ? `${Math.round((completed / receipts.total) * 100)}%` : "—", color: "var(--blue)" },
                        { label: "Average per receipt", value: completed > 0 ? formatCurrency(total / completed, summary?.currency) : "—", color: "var(--text-primary)" },
                    ].map(({ label, value, color }, i, arr) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color }}>{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
