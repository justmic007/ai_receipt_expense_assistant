import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";

export function useReceipts() {
    return useQuery({
        queryKey: ["receipts"],
        queryFn: async () => {
            const res = await api.get("/receipts");
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