import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { ArrowLeft, FileImage, Calendar, Tag, Cpu } from "lucide-react";
import Link from "next/link";

const statusStyles = {
    completed: "bg-green-100 text-green-700",
    processing: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-700",
};

export default function ReceiptDetail({ receipt }) {
    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            <div className="flex items-center gap-3">
                <Link
                    href="/receipts"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">
                        {receipt.merchant_name || receipt.original_filename}
                    </h1>
                    <p className="text-sm text-gray-400">
                        Uploaded {formatDateTime(receipt.created_at)}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusStyles[receipt.status]}`}>
                        {receipt.status}
                    </span>
                    {receipt.total_amount && (
                        <span className="text-2xl font-bold text-gray-900">
                            {formatCurrency(receipt.total_amount, receipt.currency)}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Calendar size={16} className="text-gray-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Date</p>
                            <p className="text-sm font-medium text-gray-900">
                                {formatDate(receipt.receipt_date) || "—"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Tag size={16} className="text-gray-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Category</p>
                            <p className="text-sm font-medium text-gray-900">
                                {receipt.category || "—"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileImage size={16} className="text-gray-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">File</p>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                                {receipt.original_filename}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Cpu size={16} className="text-gray-500" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">AI model</p>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                                {receipt.model_used?.split("/")[1]?.split(":")[0] || "—"}
                            </p>
                        </div>
                    </div>
                </div>

                {receipt.error_message && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                        <p className="text-sm text-red-600">{receipt.error_message}</p>
                    </div>
                )}
            </div>

            {receipt.line_items && receipt.line_items.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="font-semibold text-gray-900 mb-4">Line items</h2>
                    <div className="flex flex-col gap-2">
                        {receipt.line_items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                            >
                                <div>
                                    <p className="text-sm text-gray-900">{item.name}</p>
                                    {item.quantity && (
                                        <p className="text-xs text-gray-400">
                                            Qty: {item.quantity}
                                        </p>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {item.total
                                        ? formatCurrency(item.total, receipt.currency)
                                        : "—"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}