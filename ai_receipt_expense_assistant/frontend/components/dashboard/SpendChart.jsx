"use client";

import { formatCurrency } from "@/lib/utils";

export default function SpendChart({ summary }) {
    const categories = summary?.by_category || [];
    const total = summary?.total_spent || 0;
    const currency = summary?.currency || "NGN";

    const colors = [
        "bg-blue-500",
        "bg-purple-500",
        "bg-green-500",
        "bg-amber-500",
        "bg-red-500",
        "bg-pink-500",
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Spend by category</h2>

            {categories.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                    No expense data yet
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {categories.map((cat, index) => {
                        const percent = total > 0 ? (cat.total / total) * 100 : 0;
                        return (
                            <div key={cat.category}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-gray-600">{cat.category}</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {formatCurrency(cat.total, currency)}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${colors[index % colors.length]}`}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {cat.count} expense{cat.count !== 1 ? "s" : ""} · {percent.toFixed(1)}%
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}