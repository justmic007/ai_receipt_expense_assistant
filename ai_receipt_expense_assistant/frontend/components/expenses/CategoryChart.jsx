import { formatCurrency } from "@/lib/utils";

const COLORS = [
    { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-700" },
    { bg: "bg-purple-500", light: "bg-purple-50", text: "text-purple-700" },
    { bg: "bg-green-500", light: "bg-green-50", text: "text-green-700" },
    { bg: "bg-amber-500", light: "bg-amber-50", text: "text-amber-700" },
    { bg: "bg-red-500", light: "bg-red-50", text: "text-red-700" },
    { bg: "bg-pink-500", light: "bg-pink-50", text: "text-pink-700" },
];

export default function CategoryChart({ summary }) {
    const categories = summary?.by_category || [];
    const total = summary?.total_spent || 0;
    const currency = summary?.currency || "NGN";

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Breakdown by category</h2>

            {categories.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No data yet</p>
            ) : (
                <div className="flex flex-col gap-4">
                    {categories.map((cat, index) => {
                        const color = COLORS[index % COLORS.length];
                        const percent = total > 0 ? (cat.total / total) * 100 : 0;
                        return (
                            <div key={cat.category}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2.5 h-2.5 rounded-full ${color.bg}`} />
                                        <span className="text-sm text-gray-700">{cat.category}</span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${color.light} ${color.text}`}>
                                            {cat.count} expense{cat.count !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatCurrency(cat.total, currency)}
                                        </span>
                                        <span className="text-xs text-gray-400 ml-2">
                                            {percent.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${color.bg} transition-all duration-500`}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}