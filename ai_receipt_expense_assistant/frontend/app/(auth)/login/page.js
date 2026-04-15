"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/authSlice";
import api from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [unverifiedEmail, setUnverifiedEmail] = useState(null);


    const validate = () => {
        const e = {};
        if (!form.email) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
        if (!form.password) e.password = "Password is required";
        else if (form.password.length < 6) e.password = "At least 6 characters";
        return e;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setIsLoading(true);
        try {
            const { data } = await api.post("/auth/login", form);
            const { data: user } = await api.get("/auth/me", {
                headers: { Authorization: `Bearer ${data.access_token}` },
            });
            dispatch(setCredentials({ user, access_token: data.access_token, refresh_token: data.refresh_token }));
            toast.success("Welcome back!");
            router.replace("/dashboard");
        } catch (err) {
            const detail = err.response?.data?.detail || "";
            if (detail.toLowerCase().includes("verify")) {
                setUnverifiedEmail(form.email);
            } else {
                toast.error(detail || "Invalid email or password");
            }
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

    const handleResend = async () => {
        setIsLoading(true);
        try {
            await api.post("/auth/resend-verification", { email: form.email, password: form.password });
            toast.success("Verification email sent — check your inbox");
            setUnverifiedEmail(null);
        } catch {
            toast.error("Failed to resend — try again");
        } finally {
            setIsLoading(false);
        }
    };


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
                Welcome back
            </h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
                Sign in to your account to continue
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
                        Email address
                    </label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                        placeholder="you@example.com"
                        style={inputStyle("email")}
                        onFocus={(e) => { if (!errors.email) e.target.style.borderColor = "var(--blue)"; }}
                        onBlur={(e) => { if (!errors.email) e.target.style.borderColor = "var(--border)"; }}
                    />
                    {errors.email && <p style={{ fontSize: 12, color: "var(--error)", marginTop: 4 }}>{errors.email}</p>}
                </div>

                <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6 }}>
                        Password
                    </label>
                    <div style={{ position: "relative" }}>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: "" }); }}
                            placeholder="••••••••"
                            style={{ ...inputStyle("password"), paddingRight: 40 }}
                            onFocus={(e) => { if (!errors.password) e.target.style.borderColor = "var(--blue)"; }}
                            onBlur={(e) => { if (!errors.password) e.target.style.borderColor = "var(--border)"; }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(p => !p)}
                            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.password && <p style={{ fontSize: 12, color: "var(--error)", marginTop: 4 }}>{errors.password}</p>}
                </div>

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
                            Signing in...
                        </>
                    ) : "Sign in"}
                </button>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                {unverifiedEmail && (
                    <div style={{ marginTop: 12, padding: "12px 16px", background: "var(--warning-bg)", borderRadius: "var(--radius-md)", border: "1px solid #fde68a" }}>
                        <p style={{ fontSize: 13, color: "var(--warning-text)", marginBottom: 8 }}>
                            Your email is not verified. Check your inbox or resend the verification email.
                        </p>
                        <button
                            onClick={handleResend}
                            disabled={isLoading}
                            style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: "var(--warning-text)",
                                background: "none",
                                border: "1px solid var(--warning)",
                                borderRadius: "var(--radius-md)",
                                padding: "6px 14px",
                                cursor: "pointer",
                            }}
                        >
                            Resend verification email
                        </button>
                    </div>
                )}

            </form>

            <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 20 }}>
                Don&apos;t have an account?{" "}
                <Link href="/register" style={{ color: "var(--blue)", fontWeight: 500 }}>
                    Create one
                </Link>
            </p>
        </div>
    );
}