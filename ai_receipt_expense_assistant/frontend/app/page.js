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
      <style>{`
        @media (max-width: 768px) {
          .hero-section {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }
          .hero-left {
            padding: 40px 24px !important;
          }
          .hero-right {
            min-height: 400px !important;
          }
          .hero-h1 {
            font-size: 32px !important;
          }
          .hero-p {
            font-size: 16px !important;
          }
          .hero-buttons {
            flex-direction: column !important;
            gap: 12px !important;
          }
          .hero-btn {
            width: 100% !important;
            padding: 14px 24px !important;
          }
          .nav {
            padding: 12px 24px !important;
          }
          .features-section {
            padding: 60px 24px !important;
          }
          .how-it-works-section {
            padding: 60px 24px !important;
          }
          .cta-section {
            padding: 60px 24px !important;
          }
          .cta-button {
            width: 100% !important;
            padding: 14px 24px !important;
          }
          .footer {
            padding: 24px !important;
          }
        }
      `}</style>
      {/* Navigation */}
      <nav
        className="nav"
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
        className="hero-section"
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
          className="hero-left"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 60px",
            color: "white",
          }}
        >
          <h1 className="hero-h1" style={{ fontSize: 44, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
            Track expenses with the power of AI
          </h1>
          <p
            className="hero-p"
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
          <div className="hero-buttons" style={{ display: "flex", gap: 16, marginBottom: 48 }}>
            <button
              className="hero-btn"
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
              Get Started Free
            </button>
            <button
              className="hero-btn"
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

        {/* Right: Dashboard Mockup */}
        <div
          className="hero-right"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            padding: 40,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 380,
              background: "var(--card-bg)",
              borderRadius: 16,
              border: "1px solid var(--border)",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Dashboard Header */}
            <div style={{ padding: 20, borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0, marginBottom: 4 }}>
                Dashboard Preview
              </p>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                April 2026
              </h3>
            </div>

            {/* Stat Cards */}
            <div style={{ padding: 20, borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div
                  style={{
                    background: "rgba(59, 130, 246, 0.1)",
                    borderRadius: 8,
                    padding: 12,
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                  }}
                >
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, marginBottom: 4 }}>
                    Total Spent
                  </p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "var(--blue)", margin: 0 }}>
                    $2,450
                  </p>
                </div>
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    borderRadius: 8,
                    padding: 12,
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, marginBottom: 4 }}>
                    Receipts
                  </p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#10b981", margin: 0 }}>
                    127
                  </p>
                </div>
              </div>
              <div
                style={{
                  background: "rgba(245, 158, 11, 0.1)",
                  borderRadius: 8,
                  padding: 12,
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                  marginTop: 12,
                }}
              >
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, marginBottom: 4 }}>
                  Avg. Transaction
                </p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b", margin: 0 }}>
                  $19.29
                </p>
              </div>
            </div>

            {/* Mini Chart */}
            <div style={{ padding: 20, borderBottom: "1px solid var(--border)" }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: 0, marginBottom: 12 }}>
                Top Categories
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { name: "Groceries", value: 35, color: "#3b82f6" },
                  { name: "Dining", value: 28, color: "#10b981" },
                  { name: "Transport", value: 22, color: "#f59e0b" },
                  { name: "Shopping", value: 15, color: "#ef4444" },
                ].map((cat, idx) => (
                  <div key={idx}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 12, color: "var(--text-primary)" }}>{cat.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>
                        {cat.value}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: 6,
                        background: "var(--border)",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${cat.value}%`,
                          background: cat.color,
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Receipts Preview */}
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: 0, marginBottom: 12 }}>
                Recent Receipts
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { name: "Whole Foods", amount: "$87.43", category: "Groceries" },
                  { name: "Uber Eats", amount: "$32.50", category: "Dining" },
                  { name: "Shell Gas", amount: "$52.00", category: "Transport" },
                ].map((receipt, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 10,
                      background: "rgba(255, 255, 255, 0.02)",
                      borderRadius: 6,
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                        {receipt.name}
                      </p>
                      <p
                        style={{
                          fontSize: 10,
                          color: "var(--text-muted)",
                          margin: 0,
                          marginTop: 2,
                        }}
                      >
                        {receipt.category}
                      </p>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "var(--blue)", margin: 0 }}>
                      {receipt.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features" style={{ padding: "80px 40px", background: "var(--bg)" }}>
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
      <section className="how-it-works-section" style={{ padding: "80px 40px", background: "var(--card-bg)", borderTop: "1px solid var(--border)" }}>
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
      <section className="cta-section" style={{ padding: "80px 40px", background: "var(--bg)", textAlign: "center" }}>
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
          className="cta-button"
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
        className="footer"
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