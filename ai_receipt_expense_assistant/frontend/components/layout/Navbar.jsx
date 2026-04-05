"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { logout, selectUser } from "@/store/authSlice";
import { LogOut, Menu } from "lucide-react";

export default function Navbar({ onMenuClick }) {
    const dispatch = useDispatch();
    const router = useRouter();
    const user = useSelector(selectUser);

    const handleLogout = () => {
        dispatch(logout());
        router.replace("/login");
    };

    const initials = user?.full_name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U";

    return (
        <header
            style={{
                height: 60,
                background: "var(--card-bg)",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                position: "sticky",
                top: 0,
                zIndex: 10,
            }}
        >
            <button
                onClick={onMenuClick}
                className="lg:hidden"
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Menu size={20} />
            </button>

            <div className="hidden lg:block" style={{ width: 1 }} />

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            background: "var(--blue-light)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "var(--blue-text)",
                            flexShrink: 0,
                        }}
                    >
                        {initials}
                    </div>
                    <div className="hidden sm:flex" style={{ flexDirection: "column" }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", lineHeight: 1.3 }}>
                            {user?.full_name || "User"}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.3 }}>
                            {user?.email}
                        </span>
                    </div>
                </div>

                <div className="hidden sm:block" style={{ width: 1, height: 24, background: "var(--border)" }} />

                <button
                    onClick={handleLogout}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "6px 10px",
                        borderRadius: "var(--radius-md)",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--error)";
                        e.currentTarget.style.background = "var(--error-bg)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text-secondary)";
                        e.currentTarget.style.background = "none";
                    }}
                >
                    <LogOut size={15} />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
}