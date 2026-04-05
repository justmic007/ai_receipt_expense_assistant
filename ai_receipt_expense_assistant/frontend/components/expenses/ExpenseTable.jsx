"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useUpdateExpense } from "@/lib/hooks/useExpenses";
import { Edit2, Check, X } from "lucide-react";

const CATEGORIES = [
    "Food & Dining",
    "Groceries",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Healthcare",
    "Utilities",
    "Other",
];

export default function ExpenseTable({ expenses }) {
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const { mutate: updateExpense, isPending } = useUpdateExpense();

    const startEdit = (expense) => {
        setEditingId(expense.id);
        setEditData({
            category: expense.category || "",
            note: expense.note || "",
            amount: expense.amount || 0,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditData({});
    };

    const saveEdit = (id) => {
        updateExpense(
            { id, data: editData },
            {
                onSuccess: () => {
                    setEditingId(null);
                    setEditData({});
                },
            }
        );
    };

    if (!expenses?.items?.length) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-400">No expenses yet</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Merchant</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Date</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Note</th>
                            <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Amount</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {expenses.items.map((expense) => (
                            <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900 truncate max-w-48">
                                        {expense.merchant_name || "—"}
                                    </p>
                                </td>
                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                    {formatDate(expense.expense_date || expense.created_at)}
                                </td>
                                <td className="px-4 py-3">
                                    {editingId === expense.id ? (
                                        <select
                                            value={editData.category}
                                            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm outline-none focus:border-blue-500"
                                        >
                                            {CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                            {expense.category || "—"}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {editingId === expense.id ? (
                                        <input
                                            value={editData.note}
                                            onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                                            placeholder="Add a note..."
                                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm outline-none focus:border-blue-500 w-full"
                                        />
                                    ) : (
                                        <span className="text-gray-500 truncate max-w-32 block">
                                            {expense.note || "—"}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {editingId === expense.id ? (
                                        <input
                                            type="number"
                                            value={editData.amount}
                                            onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
                                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm outline-none focus:border-blue-500 w-28 text-right"
                                        />
                                    ) : (
                                        <span className="font-semibold text-gray-900 whitespace-nowrap">
                                            {formatCurrency(expense.amount, expense.currency)}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {editingId === expense.id ? (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => saveEdit(expense.id)}
                                                disabled={isPending}
                                                className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                                            >
                                                <Check size={14} />
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => startEdit(expense)}
                                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}