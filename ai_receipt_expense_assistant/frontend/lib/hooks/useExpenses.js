import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";

export function useExpenses() {
    return useQuery({
        queryKey: ["expenses"],
        queryFn: async () => {
            const res = await api.get("/expenses");
            return res.data;
        },
    });
}

export function useExpenseSummary() {
    return useQuery({
        queryKey: ["expenses", "summary"],
        queryFn: async () => {
            const res = await api.get("/expenses/summary");
            return res.data;
        },
    });
}

export function useUpdateExpense() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await api.patch(`/expenses/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
            toast.success("Expense updated");
        },
        onError: () => {
            toast.error("Failed to update expense");
        },
    });
}