"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { CheckCircle, XCircle } from "lucide-react";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState("verifying");

    useEffect(() => {
        const token = searchParams.get("token");
        if (!token) { setStatus("error"); return; }
        api.get(`/auth/verify-email?token=${token}`)
            .then(() => {
                setStatus("success");
                setTimeout(() => router.replace("/login"), 3000);
            })
            .catch(() => setStatus("error"));
    }, [searchParams, router]);

    return (
        <div style={{ background: "var(--card-bg)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border)", padding: "36px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", textAlign: "center" }}>
            {status === "verifying" && (
                <>
                    <div style={{ width: 40, height: 40, border: "3px solid var(--blue)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                    <p style={{ color: "var(--text-secondary)" }}>Verifying your email...</p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </>
            )}
            {status === "success" && (
                <>
                    <CheckCircle size={48} color="var(--success)" style={{ margin: "0 auto 16px" }} />
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Email verified!</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Redirecting you to login...</p>
                </>
            )}
            {status === "error" && (
                <>
                    <XCircle size={48} color="var(--error)" style={{ margin: "0 auto 16px" }} />
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Verification failed</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: 13 }}>The link is invalid or has already been used.</p>
                </>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: "center", padding: 36 }}>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
