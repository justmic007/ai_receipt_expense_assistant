"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Receipt, CheckCircle } from "lucide-react";

const features = [
    "AI reads your receipt and extracts all data instantly",
    "Automatically categorises every expense for you",
    "Full spending summary with category breakdowns",
];

export default function AuthLayout({ children }) {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) router.replace("/dashboard");
    }, [router]);

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
            }}
        >
            <div
                className="hidden lg:flex"
                style={{
                    width: "45%",
                    background: "var(--navy)",
                    padding: "48px",
                    flexDirection: "column",
                    justifyContent: "space-between",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            background: "var(--blue)",
                            borderRadius: "var(--radius-md)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Receipt size={18} color="white" />
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
                        ReceiptAI
                    </span>
                </div>

                <div>
                    <h1
                        style={{
                            fontSize: 32,
                            fontWeight: 700,
                            color: "white",
                            lineHeight: 1.2,
                            marginBottom: 16,
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Track expenses with the power of AI
                    </h1>
                    <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 36 }}>
                        Upload any receipt — our AI reads it instantly and organises your spending automatically.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {features.map((feature, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                <div
                                    style={{
                                        width: 22,
                                        height: 22,
                                        background: "#1e3a5f",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        marginTop: 1,
                                    }}
                                >
                                    <CheckCircle size={12} color="#60a5fa" />
                                </div>
                                <span style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.6 }}>
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <p style={{ fontSize: 12, color: "#475569" }}>
                    © 2026 ReceiptAI. Built with AI.
                </p>
            </div>

            <div
                style={{
                    flex: 1,
                    background: "var(--page-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "24px",
                }}
            >
                <div style={{ width: "100%", maxWidth: 400 }}>
                    <div
                        className="flex lg:hidden"
                        style={{
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 32,
                            justifyContent: "center",
                        }}
                    >
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                background: "var(--blue)",
                                borderRadius: "var(--radius-md)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Receipt size={16} color="white" />
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                            ReceiptAI
                        </span>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}