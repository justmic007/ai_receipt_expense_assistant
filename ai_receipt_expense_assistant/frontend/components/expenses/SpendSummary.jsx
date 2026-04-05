import { formatCurrency } from "@/lib/utils";
import { TrendingUp, CreditCard, Tag } from "lucide-react";

export default function SpendSummary({ summary }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <TrendingUp size={16} className="text-blue-600" />
                    </div>
                    <p className="text-sm text-gray-500">Total spent</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary?.total_spent || 0, summary?.currency)}
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                        <CreditCard size={16} className="text-purple-600" />
                    </div>
                    <p className="text-sm text-gray-500">Expenses</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    {summary?.expense_count || 0}
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                        <Tag size={16} className="text-green-600" />
                    </div>
                    <p className="text-sm text-gray-500">Categories</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    {summary?.by_category?.length || 0}
                </p>
            </div>
        </div>
    );
}