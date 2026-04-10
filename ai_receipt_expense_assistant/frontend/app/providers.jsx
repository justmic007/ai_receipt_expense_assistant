"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export default function Providers({ children }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: 1,
                        staleTime: 30000,
                        refetchOnWindowFocus: false,
                    },
                    mutations: {
                        retry: 0,
                    },
                },
            })
    );

    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                {children}
                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: "#1f2937",
                            color: "#f9fafb",
                            borderRadius: "8px",
                            fontSize: "14px",
                        },
                        success: {
                            iconTheme: {
                                primary: "#10b981",
                                secondary: "#f9fafb",
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: "#ef4444",
                                secondary: "#f9fafb",
                            },
                        },
                    }}
                />
            </QueryClientProvider>
        </Provider>
    );
}