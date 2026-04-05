"use client";

import { useParams } from "next/navigation";
import { useReceipt } from "@/lib/hooks/useReceipts";
import ReceiptDetail from "@/components/receipts/ReceiptDetail";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ReceiptDetailPage() {
    const { id } = useParams();
    const { data: receipt, isLoading, isError } = useReceipt(id);

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center gap-4 py-20">
                <p className="text-gray-500">Receipt not found</p>
                <Link href="/receipts" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                    <ArrowLeft size={14} /> Back to receipts
                </Link>
            </div>
        );
    }

    return <ReceiptDetail receipt={receipt} />;
}