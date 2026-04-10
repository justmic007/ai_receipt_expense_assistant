"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const fields = [
    { key: "full_name", label: "Full name", type: "text", placeholder: "Micah Johnson" },
    { key: "email", label: "Email address", type: "email", placeholder: "you@example.com" },
    { key: "password", label: "Password", type: "password", placeholder: "••••••••" },
    { key: "confirmPassword", label: "Confirm password", type: "password", placeholder: "••••••••" },
];

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ full_name: "", email: "", password: "", confirmPassword: "" });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({ password: false, confirmPassword: false });

    const validate = () => {
        const e = {};
        if (!form.full_name) e.full_name = "Full name is required";
        if (!form.email) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
        if (!form.password) e.password = "Password is required";
        else if (form.password.length < 6) e.password = "At least 6 characters";
        if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
        else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setIsLoading(true);
        try {
            await api.post("/auth/register", {
                full_name: form.full_name,
                email: form.email,
                password: form.password,
            });
            toast.success("Account created! Please sign in.");
            router.replace("/login");
        } catch (err) {
            toast.error(err.response?.data?.detail || "Registration failed. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = (field) => ({
        width: "100%",
        height: 42,
        padding: "0 14px",
        border: `1.5px solid ${errors[field] ? "var(--error)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        fontSize: 14,
        color: "var(--text-primary)",
        background: "var(--card-bg)",
        outline: "none",
        transition: "border-color 0.15s",
    });

    return (
        <div
            style={{
                background: "var(--card-bg)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border)",
                padding: "36px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
        >
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, letterSpacing: "-0.02em" }}>
                Create account
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
                Start tracking your expenses with AI
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {fields.map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
                            {label}
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={type === "password" ? (showPasswords[key] ? "text" : "password") : type}
                                value={form[key]}
                                onChange={(e) => { setForm({ ...form, [key]: e.target.value }); setErrors({ ...errors, [key]: "" }); }}
                                placeholder={placeholder}
                                style={{ ...inputStyle(key), paddingRight: type === "password" ? 40 : 14 }}
                                onFocus={(e) => { if (!errors[key]) e.target.style.borderColor = "var(--blue)"; }}
                                onBlur={(e) => { if (!errors[key]) e.target.style.borderColor = "var(--border)"; }}
                            />
                            {type === "password" && (
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(p => ({ ...p, [key]: !p[key] }))}
                                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}
                                >
                                    {showPasswords[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            )}
                        </div>
                        {errors[key] && <p style={{ fontSize: 12, color: "var(--error)", marginTop: 4 }}>{errors[key]}</p>}
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: "100%",
                        height: 42,
                        background: isLoading ? "#93c5fd" : "var(--blue)",
                        color: "white",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: isLoading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "background 0.15s",
                        marginTop: 4,
                    }}
                    onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = "var(--blue-hover)"; }}
                    onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = "var(--blue)"; }}
                >
                    {isLoading ? (
                        <>
                            <div style={{ width: 16, height: 16, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                            Creating account...
                        </>
                    ) : "Create account"}
                </button>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </form>

            <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 20 }}>
                Already have an account?{" "}
                <Link href="/login" style={{ color: "var(--blue)", fontWeight: 500 }}>
                    Sign in
                </Link>
            </p>
        </div>
    );
}