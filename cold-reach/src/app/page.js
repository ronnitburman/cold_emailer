"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Zap, Shield, BarChart } from "lucide-react";
import SignInModal from "@/components/SignInModal";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
    const [isSignInOpen, setIsSignInOpen] = useState(false);
    const { isAuthenticated, user, isLoading } = useAuth();

    return (
        <div className="landing-container">
            <nav className="navbar">
                <div className="logo">ColdReach</div>
                <div className="nav-links">
                    {isLoading ? (
                        <div className="nav-skeleton"></div>
                    ) : isAuthenticated ? (
                        <>
                            <div className="user-avatar">
                                {user?.picture ? (
                                    <img src={user.picture} alt={user.name || "User"} />
                                ) : (
                                    <span>{user?.name?.[0] || user?.email?.[0] || "U"}</span>
                                )}
                            </div>
                            <Link href="/dashboard" className="cta-btn secondary">Go to Dashboard</Link>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsSignInOpen(true)} className="signin-link">Sign In</button>
                            <button onClick={() => setIsSignInOpen(true)} className="cta-btn secondary">Get Started</button>
                        </>
                    )}
                </div>
            </nav>

            <main>
                <div className="hero-section">
                    <div className="hero-badge">New: AI-Powered Personalization</div>
                    <h1 className="hero-title">
                        Automate Your <span className="highlight">Cold Outreach</span> With Intelligence
                    </h1>
                    <p className="hero-sub">
                        The all-in-one platform to find leads, generate tailored emails, and track performance.
                        Scale your outreach without sounding like a robot.
                    </p>

                    <div className="hero-actions">
                        {isAuthenticated ? (
                            <Link href="/dashboard" className="cta-btn primary">
                                Go to Dashboard <ArrowRight size={20} />
                            </Link>
                        ) : (
                            <button onClick={() => setIsSignInOpen(true)} className="cta-btn primary">
                                Get Started Free <ArrowRight size={20} />
                            </button>
                        )}
                        <button className="cta-btn text-only">View Documentation</button>
                    </div>

                    <div className="hero-visual">
                        <div className="mock-window">
                            <div className="window-header">
                                <div className="dot red"></div>
                                <div className="dot yellow"></div>
                                <div className="dot green"></div>
                            </div>
                            <div className="window-content">
                                <div className="email-row">
                                    <div className="avatar">JD</div>
                                    <div className="email-meta">
                                        <div className="subject">Re: Partnership Opportunity</div>
                                        <div className="preview">Hi Ronnit, I'd love to hear more about...</div>
                                    </div>
                                    <div className="tag success">Replied</div>
                                </div>
                                <div className="email-row">
                                    <div className="avatar blue">AS</div>
                                    <div className="email-meta">
                                        <div className="subject">Question for Acme Inc</div>
                                        <div className="preview">I noticed that your team is currently...</div>
                                    </div>
                                    <div className="tag">Sent</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <Zap className="feature-icon" size={32} />
                        <h3>Instant Personalization</h3>
                        <p>Generate hooks based on prospect's LinkedIn data automatically.</p>
                    </div>
                    <div className="feature-card">
                        <BarChart className="feature-icon" size={32} />
                        <h3>Real-time Analytics</h3>
                        <p>Track opens, clicks, and replies with 99.9% accuracy.</p>
                    </div>
                    <div className="feature-card">
                        <Shield className="feature-icon" size={32} />
                        <h3>Deliverability First</h3>
                        <p>Warm-up algorithms ensure your emails land in the primary inbox.</p>
                    </div>
                </div>
            </main>

            <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />

            <style jsx>{`
        .landing-container {
          min-height: 100vh;
          background-color: var(--background);
          color: var(--foreground);
          overflow-x: hidden;
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.05em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-skeleton {
          width: 100px;
          height: 36px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--card-bg);
          border: 2px solid var(--card-border);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .signin-link {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--muted);
          transition: color 0.2s;
          background: transparent;
          border: none;
          cursor: pointer;
        }
        
        .signin-link:hover { color: var(--foreground); }

        .hero-section {
          padding: 6rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--card-border);
          border-radius: 9999px;
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--primary);
          margin-bottom: 2rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          max-width: 800px;
        }
        
        .highlight {
          background: linear-gradient(135deg, #fff 0%, #999 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-sub {
          font-size: 1.25rem;
          color: var(--muted);
          max-width: 600px;
          line-height: 1.6;
          margin-bottom: 3rem;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 5rem;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          border-radius: 0.75rem;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
          border: none;
        }

        .cta-btn.primary {
          background-color: var(--foreground);
          color: var(--background);
        }
        
        .cta-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
        }

        .cta-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: var(--foreground);
          padding: 0.6rem 1.25rem;
          border-radius: 0.5rem;
          font-size: 0.9375rem;
        }
        
        .cta-btn.secondary:hover { background: rgba(255, 255, 255, 0.15); }

        .cta-btn.text-only {
          background: transparent;
          color: var(--muted);
        }
        
        .cta-btn.text-only:hover { color: var(--foreground); }

        .hero-visual {
          width: 100%;
          max-width: 800px;
          perspective: 1000px;
        }

        .mock-window {
          background: #121212;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 1rem;
          transform: rotateX(10deg);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
        }

        .window-header {
          display: flex;
          gap: 6px;
          margin-bottom: 1rem;
        }

        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .red { background: #ff5f57; }
        .yellow { background: #febc2e; }
        .green { background: #28c840; }

        .email-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          background: rgba(255,255,255,0.03);
          margin-bottom: 0.5rem;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        .avatar.blue { background: #2563eb; }

        .email-meta { flex: 1; }
        .subject { font-weight: 600; font-size: 0.9rem; }
        .preview { font-size: 0.8rem; color: #666; }

        .tag {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 12px;
          background: #333;
          color: #888;
        }
        .tag.success { background: rgba(34, 197, 94, 0.2); color: #22c55e; }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto 6rem;
          padding: 0 2rem;
        }

        .feature-card {
           padding: 2rem;
           background: rgba(255,255,255,0.02);
           border: 1px solid var(--card-border);
           border-radius: 1rem;
        }
        
        .feature-icon {
          color: var(--foreground);
          margin-bottom: 1rem;
        }
        
        .feature-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .feature-card p {
          color: var(--muted);
          line-height: 1.6;
        }
        
        @media (max-width: 768px) {
           .hero-title { font-size: 2.5rem; }
        }
      `}</style>
        </div>
    );
}
