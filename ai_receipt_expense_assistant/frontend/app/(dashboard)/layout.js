"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser, logout } from "@/store/authSlice";
import api from "@/lib/api";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout({ children }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const [isReady, setIsReady] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.replace("/login");
            return;
        }
        api
            .get("/auth/me")
            .then((res) => {
                dispatch(setUser(res.data));
                setIsReady(true);
            })
            .catch(() => {
                dispatch(logout());
                router.replace("/login");
            });
    }, [router, dispatch]);

    if (!isReady) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    background: "var(--page-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 12,
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        border: "2.5px solid var(--blue)",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }}
                />
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--page-bg)" }}>
            <div className="sidebar-wrapper">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <Navbar onMenuClick={() => setSidebarOpen(true)} />
                <main style={{ flex: 1, padding: "24px", overflow: "auto" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}