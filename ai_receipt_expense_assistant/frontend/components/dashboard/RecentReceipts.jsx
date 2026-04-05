import Link from "next/link";
import { formatCurrency, formatDate, truncate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default function RecentReceipts({ receipts }) {
    const recent = receipts?.items?.slice(0, 5) || [];

    const statusColors = {
        completed: "bg-green-100 text-green-700",
        processing: "bg-amber-100 text-amber-700",
        failed: "bg-red-100 text-red-700",
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recent receipts</h2>
                <Link
                    href="/receipts"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                    View all <ArrowRight size={14} />
                </Link>
            </div>

            {recent.length === 0 ? (
                <div className="p-8 text-center">
                    <p className="text-gray-400 text-sm">No receipts yet</p>
                    <Link
                        href="/receipts"
                        className="text-blue-600 text-sm hover:underline mt-1 inline-block"
                    >
                        Upload your first receipt
                    </Link>
                </div>
            ) : (
                <div className="divide-y divide-gray-50">
                    {recent.map((receipt) => (
                        <Link
                            key={receipt.id}
                            href={`/receipts/${receipt.id}`}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {truncate(receipt.merchant_name || receipt.original_filename, 35)}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {formatDate(receipt.receipt_date || receipt.created_at)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[receipt.status]}`}>
                                    {receipt.status}
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                    {receipt.total_amount
                                        ? formatCurrency(receipt.total_amount, receipt.currency)
                                        : "—"}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}