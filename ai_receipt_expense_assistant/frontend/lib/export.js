import api from "@/lib/api";

export async function downloadExport({ type, format, fromDate, toDate }) {
    const endpoint = type === "expenses" ? "/expenses/export" : "/receipts/export";

    const params = new URLSearchParams({ format });
    if (fromDate) params.append("from_date", fromDate);
    if (toDate) params.append("to_date", toDate);

    const response = await api.get(`${endpoint}?${params.toString()}`, {
        responseType: "blob",
    });

    const extension = format === "excel" ? "xlsx" : "pdf";
    const filename = `${type}_${fromDate || "all"}_${toDate || "today"}.${extension}`;

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

export function getDatePresets() {
    const today = new Date();
    const fmt = (d) => d.toISOString().split("T")[0];

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);

    return [
        { label: "This month", from: fmt(startOfMonth), to: fmt(today) },
        { label: "Last month", from: fmt(startOfLastMonth), to: fmt(endOfLastMonth) },
        { label: "Last 3 months", from: fmt(threeMonthsAgo), to: fmt(today) },
        { label: "All time", from: null, to: null },
    ];
}