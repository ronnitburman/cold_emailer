"use client";

import { useState } from "react";
import { ArrowRight, Link as LinkIcon, Upload, CheckCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import EmailEditor from "@/components/EmailEditor";
import { useRouter } from "next/navigation";

export default function NewCampaign() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [sheetUrl, setSheetUrl] = useState("");

    const steps = [
        { number: 1, title: "Data Source" },
        { number: 2, title: "Template" },
        { number: 3, title: "Review" }
    ];

    const handleLoadSheet = () => {
        if (!sheetUrl) return;
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setContacts([
                { firstName: "Sarah", company: "TechFlow", email: "sarah@techflow.io" },
                { firstName: "Mike", company: "DataSystems", email: "mike@datasys.com" },
                { firstName: "Jessica", company: "CloudScale", email: "jess@cloudscale.net" },
            ]);
            setLoading(false);
            setStep(2);
        }, 1500);
    };

    const handleLaunch = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            router.push("/");
        }, 2000);
    };

    return (
        <div className="new-campaign-container">
            <div className="header-row">
                <Link href="/" className="back-link">
                    <ChevronLeft size={20} /> Back to Dashboard
                </Link>
                <h1 className="page-title">New Campaign</h1>
            </div>

            <div className="stepper">
                {steps.map((s, idx) => (
                    <div key={s.number} className="step-item">
                        <div className={`step-circle ${step >= s.number ? "active" : ""}`}>
                            {step > s.number ? <CheckCircle size={16} /> : s.number}
                        </div>
                        <span className={`step-title ${step >= s.number ? "active-text" : ""}`}>
                            {s.title}
                        </span>
                        {idx < steps.length - 1 && <div className="step-line" />}
                    </div>
                ))}
            </div>

            <div className="step-content">
                {step === 1 && (
                    <div className="card step-card">
                        <h2 className="step-heading">Connect Data Source</h2>
                        <p className="step-sub">Enter your Google Sheet URL to load contacts.</p>

                        <div className="input-group">
                            <LinkIcon className="input-icon" size={18} />
                            <input
                                type="text"
                                placeholder="https://docs.google.com/spreadsheets/d/..."
                                className="url-input"
                                value={sheetUrl}
                                onChange={(e) => setSheetUrl(e.target.value)}
                            />
                        </div>

                        <div className="action-area">
                            <button
                                className={`primary-btn ${loading ? "loading" : ""}`}
                                onClick={handleLoadSheet}
                                disabled={loading || !sheetUrl}
                            >
                                {loading ? "Loading Contacts..." : (
                                    <>Load Data <ArrowRight size={18} /></>
                                )}
                            </button>
                        </div>

                        {/* Hint for demo */}
                        <p className="hint">
                            Demo: Paste any text or URL to simulate loading.
                        </p>
                    </div>
                )}

                {step === 2 && (
                    <div className="editor-wrapper">
                        <EmailEditor contact={contacts[0]} />
                        <div className="bottom-actions">
                            <button className="secondary-btn" onClick={() => setStep(1)}>Back</button>
                            <button className="primary-btn" onClick={() => setStep(3)}>Next: Review</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="card step-card">
                        <h2 className="step-heading">Ready to Launch?</h2>
                        <div className="summary-stats">
                            <div className="stat">
                                <span className="stat-val">{contacts.length}</span>
                                <span className="stat-label">Contacts Listed</span>
                            </div>
                            <div className="stat">
                                <span className="stat-val">3</span>
                                <span className="stat-label">Variables Found</span>
                            </div>
                        </div>

                        <div className="review-list">
                            <h3>Contacts Preview</h3>
                            {contacts.map((c, i) => (
                                <div key={i} className="contact-row">
                                    <span>{c.firstName}</span>
                                    <span className="company-tag">{c.company}</span>
                                    <span className="email-tag">{c.email}</span>
                                </div>
                            ))}
                        </div>

                        <div className="action-area">
                            <button className="secondary-btn" onClick={() => setStep(2)}>Back</button>
                            <button className="primary-btn launch-btn" onClick={handleLaunch}>
                                {loading ? "Launching..." : "Launch Campaign"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .new-campaign-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .header-row {
          margin-bottom: 2rem;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--muted);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        
        .back-link:hover { color: var(--foreground); }

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
        }

        .stepper {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 3rem;
          gap: 1rem;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid var(--card-border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          font-weight: 600;
          font-size: 0.875rem;
          background-color: var(--card-bg);
        }

        .step-circle.active {
          border-color: var(--foreground);
          color: var(--foreground);
          background-color: var(--card-border);
        }

        .step-title {
          font-size: 0.875rem;
          color: var(--muted);
          font-weight: 500;
        }

        .active-text { color: var(--foreground); }

        .step-line {
          width: 40px;
          height: 2px;
          background-color: var(--card-border);
          margin-left: 0.5rem;
        }

        .card {
          background-color: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 2rem;
        }

        .step-card {
          max-width: 600px;
          margin: 0 auto;
        }

        .step-heading {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          color: var(--foreground);
        }

        .step-sub {
          color: var(--muted);
          margin-bottom: 2rem;
        }

        .input-group {
          position: relative;
          margin-bottom: 1.5rem;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
        }

        .url-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          background-color: var(--background);
          border: 1px solid var(--card-border);
          border-radius: 0.5rem;
          color: var(--foreground);
          font-size: 1rem;
        }
        
        .url-input:focus {
           outline: none;
           border-color: var(--primary);
        }

        .action-area {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .primary-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: var(--foreground);
          color: var(--background);
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        
        .primary-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .secondary-btn {
           background: transparent;
           border: 1px solid var(--card-border);
           color: var(--foreground);
           padding: 0.75rem 1.5rem;
           border-radius: 0.5rem;
           font-weight: 500;
           cursor: pointer;
        }

        .hint {
          margin-top: 1rem;
          font-size: 0.75rem;
          color: var(--muted);
          text-align: center;
        }
        
        .editor-wrapper {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .bottom-actions {
          display: flex;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid var(--card-border);
        }
        
        .summary-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--card-border);
        }
        
        .stat {
          display: flex;
          flex-direction: column;
        }
        
        .stat-val {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: var(--muted);
        }
        
        .review-list {
          margin-bottom: 2rem;
        }
        
        .review-list h3 {
           font-size: 1rem;
           margin-bottom: 1rem;
           color: var(--foreground);
        }
        
        .contact-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: rgba(255,255,255,0.03);
          border-radius: 0.5rem;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          color: var(--muted);
        }
        
        .company-tag { color: var(--foreground); font-weight: 500; }
        .email-tag { margin-left: auto; font-size: 0.75rem; }
        
        .launch-btn {
          background-color: var(--accent-green);
          color: #fff;
        }
      `}</style>
        </div>
    );
}
