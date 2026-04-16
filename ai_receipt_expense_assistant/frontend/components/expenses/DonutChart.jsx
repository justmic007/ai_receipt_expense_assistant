"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
"use client";

import { formatCurrency } from "@/lib/utils";

const COLORS = ["#2563eb", "#7c3aed", "#16a34a", "#d97706", "#dc2626", "#db2777"];

const CustomTooltip = ({ active, payload, currency }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    return (
        <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
            <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{name}</p>
            <p style={{ color: "var(--text-muted)" }}>{formatCurrency(value, currency)}</p>
        </div>
    );
};

export default function DonutChart({ categories, currency }) {
    if (!categories?.length) return (
        <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "40px 0" }}>No data yet</p>
    );

    const data = categories.map((cat) => ({ name: cat.category, value: cat.total }));

    return (
        <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Pie data={data} cx="50%" cy="45%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip currency={currency} />} />
                <Legend formatter={(value) => <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{value}</span>} />
            </PieChart>
        </ResponsiveContainer>
    );
}
