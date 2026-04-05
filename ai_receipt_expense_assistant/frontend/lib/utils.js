import { clsx } from "clsx";

export function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount, currency = "NGN") {
    if (amount === null || amount === undefined) return "—";
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(dateString) {
    if (!dateString) return "—";
    try {
        return new Intl.DateTimeFormat("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(new Date(dateString));
    } catch {
        return dateString;
    }
}

export function formatDateTime(dateString) {
    if (!dateString) return "—";
    try {
        return new Intl.DateTimeFormat("en-NG", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(dateString));
    } catch {
        return dateString;
    }
}

export function getStatusColor(status) {
    switch (status) {
        case "completed":
            return "green";
        case "processing":
            return "amber";
        case "failed":
            return "red";
        default:
            return "gray";
    }
}

export function truncate(str, length = 30) {
    if (!str) return "—";
    return str.length > length ? `${str.substring(0, length)}...` : str;
}