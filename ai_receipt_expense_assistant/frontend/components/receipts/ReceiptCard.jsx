import Link from "next/link";
import { formatCurrency, formatDate, truncate } from "@/lib/utils";
import { FileImage, ChevronRight } from "lucide-react";

const statusStyles = {
    completed: "bg-green-100 text-green-700",
    processing: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-700",
};

export default function ReceiptCard({ receipt }) {
    return (
        <Link
            href={`/receipts/${receipt.id}`}
            className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
        >
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileImage size={20} className="text-gray-400" />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                    {truncate(receipt.merchant_name || receipt.original_filename, 40)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[receipt.status]}`}>
                        {receipt.status}
                    </span>
                    <span className="text-xs text-gray-400">
                        {formatDate(receipt.receipt_date || receipt.created_at)}
                    </span>
                    {receipt.category && (
                        <span className="text-xs text-gray-400">· {receipt.category}</span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-semibold text-gray-900">
                    {receipt.total_amount
                        ? formatCurrency(receipt.total_amount, receipt.currency)
                        : "—"}
                </span>
                <ChevronRight size={16} className="text-gray-400" />
            </div>
        </Link>
    );
}