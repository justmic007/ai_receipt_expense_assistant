'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Receipt, Zap, PieChart, Lock, Smartphone } from "lucide-react";

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: Receipt,
      title: "Smart Receipt Scanning",
      description: "AI instantly reads and extracts all data from your receipts",
    },
    {
      icon: Zap,
      title: "Auto Categorization",
      description: "Expenses are automatically organized into categories",
    },
    {
      icon: PieChart,
      title: "Spending Analytics",
      description: "Visualize your spending patterns with interactive charts",
    },
    {
      icon: Lock,
      title: "Secure & Private",
      description: "Your financial data is encrypted and never shared",
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Track expenses on the go with our responsive design",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Upload Receipt",
      description: "Take a photo or upload a receipt image",
    },
    {
      number: 2,
      title: "AI Processes",
      description: "Our AI extracts data and categorizes automatically",
    },
    {
      number: 3,
      title: "View Insights",
      description: "See your spending summary and analytics",
    },
  ];

  return (
    <div style={{ background: "var(--bg)" }}>
      {/* Navigation */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 40px",
          borderBottom: "1px solid var(--border)",
          background: "var(--card-bg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "var(--blue)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Receipt size={18} color="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
            ReceiptAI
          </span>
        </div>
        <Link
          href="/login"
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--blue)",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "600px",
          background: "linear-gradient(135deg, #0f1729 0%, #1a2642 100%)",
          gap: 0,
        }}
      >
        {/* Left: Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 60px",
            color: "white",
          }}
        >
          <h1 style={{ fontSize: 44, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
            Track expenses with the power of AI
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255, 255, 255, 0.7)",
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Upload any receipt — our AI reads it instantly and organizes your spending automatically.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: 16, marginBottom: 48 }}>
            <button
              onClick={() => router.push("/register")}
              style={{
                padding: "12px 32px",
                background: "var(--blue)",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.target.style.opacity = "1")}
            >
              Get Started
            </button>
            <button
              onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })}
              style={{
                padding: "12px 32px",
                background: "transparent",
                color: "white",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.1)")}
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              Learn More
            </button>
          </div>

          {/* Feature Bullets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              "AI reads your receipt and extracts all data instantly",
              "Automatically categorizes every expense for you",
              "Full spending summary with category breakdowns",
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    background: "rgba(59, 130, 246, 0.2)",
                    border: "2px solid var(--blue)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Check size={12} color="var(--blue)" />
                </div>
                <span style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.8)" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Visual */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              width: 300,
              height: 400,
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: 16,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <Receipt size={48} color="rgba(255, 255, 255, 0.3)" />
            <p style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.4)", textAlign: "center" }}>
              Dashboard Preview
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: "80px 40px", background: "var(--bg)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 12,
              color: "var(--text-primary)",
            }}
          >
            Powerful Features
          </h2>
          <p
            style={{
              fontSize: 16,
              textAlign: "center",
              color: "var(--text-muted)",
              marginBottom: 60,
            }}
          >
            Everything you need to manage your expenses efficiently
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 32,
            }}
          >
            {features.map((feature, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-lg)",
                  padding: 32,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--blue)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 12px 24px rgba(59, 130, 246, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <feature.icon
                  size={32}
                  color="var(--blue)"
                  style={{ marginBottom: 16 }}
                />
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: "80px 40px", background: "var(--card-bg)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 60,
              color: "var(--text-primary)",
            }}
          >
            How It Works
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 32,
            }}
          >
            {steps.map((step, idx) => (
              <div key={idx} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    background: "var(--blue)",
                    color: "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    fontWeight: 700,
                    margin: "0 auto 16px",
                  }}
                >
                  {step.number}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "80px 40px", background: "var(--bg)", textAlign: "center" }}>
        <h2
          style={{
            fontSize: 36,
            fontWeight: 700,
            marginBottom: 16,
            color: "var(--text-primary)",
          }}
        >
          Ready to take control of your finances?
        </h2>
        <p
          style={{
            fontSize: 18,
            color: "var(--text-muted)",
            marginBottom: 32,
          }}
        >
          Start tracking your expenses with AI today — it only takes a minute to get started.
        </p>
        <button
          onClick={() => router.push("/register")}
          style={{
            padding: "14px 40px",
            background: "var(--blue)",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.target.style.opacity = "1")}
        >
          Get Started Free
        </button>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "32px 40px",
          borderTop: "1px solid var(--border)",
          background: "var(--card-bg)",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: 14,
        }}
      >
        <p>© 2026 ReceiptAI. Built with AI. All rights reserved.</p>
      </footer>
    </div>
  );
}