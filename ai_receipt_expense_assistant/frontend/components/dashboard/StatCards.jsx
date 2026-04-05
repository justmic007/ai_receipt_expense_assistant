import { formatCurrency } from "@/lib/utils";
import { Receipt, CreditCard, TrendingUp, CheckCircle } from "lucide-react";

export default function StatCards({ summary, receipts }) {
    const stats = [
        {
            label: "Total spent",
            value: formatCurrency(summary?.total_spent || 0, summary?.currency),
            icon: TrendingUp,
            color: "blue",
        },
        {
            label: "Total receipts",
            value: receipts?.total || 0,
            icon: Receipt,
            color: "purple",
        },
        {
            label: "Total expenses",
            value: summary?.expense_count || 0,
            icon: CreditCard,
            color: "green",
        },
        {
            label: "Categories",
            value: summary?.by_category?.length || 0,
            icon: CheckCircle,
            color: "amber",
        },
    ];

    const colorMap = {
        blue: "bg-blue-50 text-blue-600",
        purple: "bg-purple-50 text-purple-600",
        green: "bg-green-50 text-green-600",
        amber: "bg-amber-50 text-amber-600",
    };

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color }) => (
                <div
                    key={label}
                    className="bg-white rounded-xl border border-gray-200 p-5"
                >
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-500">{label}</p>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
                            <Icon size={18} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            ))}
        </div>
    );
}