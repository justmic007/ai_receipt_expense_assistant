"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#2563eb", "#7c3aed", "#16a34a", "#d97706", "#dc2626", "#db2777"];

const CustomTooltip = ({ active, payload, currency }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
            <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{payload[0].payload.category}</p>
            <p style={{ color: "var(--text-muted)" }}>{formatCurrency(payload[0].value, currency)}</p>
        </div>
    );
};

export default function SpendBarChart({ categories, currency }) {
    if (!categories?.length) return (
        <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>No data yet</p>
    );

    const data = [...categories].sort((a, b) => b.total - a.total).slice(0, 6);

    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    tickFormatter={(v) => v.length > 8 ? v.slice(0, 8) + "…" : v}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip currency={currency} />} cursor={{ fill: "var(--page-bg)" }} />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
