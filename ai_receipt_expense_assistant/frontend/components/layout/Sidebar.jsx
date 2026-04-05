"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Receipt, CreditCard, BarChart3, X,
} from "lucide-react";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/receipts", label: "Receipts", icon: Receipt },
    { href: "/expenses", label: "Expenses", icon: CreditCard },
    { href: "/summary", label: "Summary", icon: BarChart3 },
];

export default function Sidebar({ isOpen, onClose }) {
    const pathname = usePathname();

    return (
        <>
            {isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 20,
                        background: "rgba(0,0,0,0.5)",
                    }}
                    className="lg:hidden"
                />
            )}

            <aside
                style={{
                    width: "var(--sidebar-width)",
                    background: "var(--navy)",
                    borderRight: "1px solid var(--navy-hover)",
                    display: "flex",
                    flexDirection: "column",
                    flexShrink: 0,
                    height: "100vh",
                    position: "sticky",
                    top: 0,
                    zIndex: 30,
                    transition: "transform 0.3s ease",
                }}
                className={isOpen ? "sidebar-open" : "sidebar-closed"}
            >
                <style>{`
                    @media (max-width: 1023px) {
                        .sidebar-closed {
                            transform: translateX(-100%); 
                            position: fixed !important; 
                            top: 0; 
                            left: 0;
                            height: 100vh !important;
                        }
                        .sidebar-open {
                            transform: translateX(0); 
                            position: fixed !important; 
                            top: 0; 
                            left: 0;
                            height: 100vh !important;
                        }
                    }
                    @media (min-width: 1024px) {
                        .sidebar-closed { transform: translateX(0); position: sticky !important; }
                        .sidebar-open { transform: translateX(0); position: sticky !important; }
                    }
        `}</style>

                <div style={{ padding: "20px 16px", borderBottom: "1px solid var(--navy-hover)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: "var(--blue)", borderRadius: "var(--radius-md)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Receipt size={16} color="white" />
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
                            ReceiptAI
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden"
                        style={{ color: "var(--navy-text)", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = pathname === href || pathname.startsWith(href + "/");
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={onClose}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "9px 12px",
                                    borderRadius: "var(--radius-md)",
                                    fontSize: 14,
                                    fontWeight: isActive ? 500 : 400,
                                    color: isActive ? "white" : "var(--navy-text)",
                                    background: isActive ? "var(--navy-hover)" : "transparent",
                                    borderLeft: isActive ? "3px solid var(--blue)" : "3px solid transparent",
                                    transition: "all 0.15s ease",
                                    textDecoration: "none",
                                }}
                            >
                                <Icon size={17} />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: "12px 16px", borderTop: "1px solid var(--navy-hover)" }}>
                    <p style={{ fontSize: 11, color: "var(--navy-muted)", textAlign: "center" }}>
                        AI Receipt Assistant v1.0
                    </p>
                </div>
            </aside>
        </>
    );
}