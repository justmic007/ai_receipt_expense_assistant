import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";

export function useReceipts(filters = {}) {
    const { search = "", status = "", category = "", dateFrom = "", dateTo = "", amountMin = "", amountMax = "" } = filters;

    return useQuery({
        queryKey: ["receipts", { search, status, category, dateFrom, dateTo, amountMin, amountMax }],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append("search", search);
            if (status) params.append("status", status);
            if (category) params.append("category", category);
            if (dateFrom) params.append("date_from", dateFrom);
            if (dateTo) params.append("date_to", dateTo);
            if (amountMin) params.append("amount_min", amountMin);
            if (amountMax) params.append("amount_max", amountMax);

            const url = `/receipts${params.toString() ? "?" + params.toString() : ""}`;
            const res = await api.get(url);
            return res.data;
        },
    });
}

export function useReceipt(id) {
    return useQuery({
        queryKey: ["receipts", id],
        queryFn: async () => {
            const res = await api.get(`/receipts/${id}`);
            return res.data;
        },
        enabled: !!id,
    });
}

export function useUploadReceipt() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            const res = await api.post("/receipts/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    return percent;
                },
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            toast.success("Receipt processed successfully");
        },
        onError: (error) => {
            const message = error.response?.data?.detail || "Upload failed";
            toast.error(message);
        },
    });
}

export function useBatchUpload() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (files) => {
            const formData = new FormData();
            files.forEach((file) => formData.append("files", file));
            const res = await api.post("/receipts/batch", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        },
        onError: (error) => {
            const message = error.response?.data?.detail || "Batch upload failed";
            toast.error(message);
        },
    });
}

export function useBatchStatus(batchId) {
    return useQuery({
        queryKey: ["batch", batchId],
        queryFn: async () => {
            const res = await api.get(`/receipts/batch/${batchId}`);
            return res.data;
        },
        enabled: !!batchId,
        refetchInterval: (data) => {
            if (!data) return 5000;
            return data.status === "completed" ? false : 5000;
        },
    });
}

export function useDeleteReceipt() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (receiptId) => {
            const res = await api.delete(`/receipts/${receiptId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["receipts"] });
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            toast.success("Receipt deleted successfully");
        },
        onError: (error) => {
            const message = error.response?.data?.detail || "Failed to delete receipt";
            toast.error(message);
        },
    });
}