"use client";

import { useState } from "react";
import { Copy, RefreshCw, Save } from "lucide-react";

export default function EmailEditor({ templateData, onUpdate, contact }) {
    const [subject, setSubject] = useState(templateData?.subject || "Quick question for {{company_name}}");
    const [body, setBody] = useState(templateData?.body ||
        "Hi {{first_name}},\n\nI noticed that {{company_name}} is looking to improve its cold outreach.\n\nOur solution helps you {{benefit_1}} by {{solution_mechanism}}.\n\nAre you open to a quick chat next week?\n\nBest,\nRonnit"
    );

    const previewBody = body
        .replace("{{first_name}}", contact?.firstName || "Alex")
        .replace("{{company_name}}", contact?.company || "Acme Corp")
        .replace("{{benefit_1}}", "increase reply rates")
        .replace("{{solution_mechanism}}", "automating personalized intros");

    const previewSubject = subject
        .replace("{{company_name}}", contact?.company || "Acme Corp");

    return (
        <div className="email-editor-container">
            <div className="editor-col">
                <div className="section-title">
                    <h3>Edit Template</h3>
                    <span className="badge">Variable</span>
                </div>

                <div className="form-group">
                    <label>Subject Line</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="input-field"
                    />
                </div>

                <div className="form-group">
                    <label>Email Body</label>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="textarea-field"
                        rows={12}
                    />
                </div>

                <div className="action-row">
                    <button className="secondary-btn">
                        <Save size={16} /> Save Template
                    </button>
                </div>
            </div>

            <div className="preview-col">
                <div className="section-title">
                    <h3>Preview</h3>
                    <button className="icon-btn" title="Refresh Preview">
                        <RefreshCw size={16} />
                    </button>
                </div>

                <div className="email-preview-card">
                    <div className="email-header">
                        <div className="meta-row">
                            <span className="label">To:</span>
                            <span className="value">{contact?.email || "alex@acme.com"}</span>
                        </div>
                        <div className="meta-row">
                            <span className="label">Subject:</span>
                            <span className="value">{previewSubject}</span>
                        </div>
                    </div>

                    <div className="email-body">
                        {previewBody.split('\n').map((line, i) => (
                            <p key={i} className="email-line">{line || '\u00A0'}</p>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .email-editor-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          height: 100%;
        }

        .section-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-title h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--foreground);
        }

        .badge {
          font-size: 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          color: var(--muted);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--muted);
          margin-bottom: 0.5rem;
        }

        .input-field, .textarea-field {
          width: 100%;
          background-color: var(--background);
          border: 1px solid var(--card-border);
          border-radius: 0.5rem;
          padding: 0.75rem;
          color: var(--foreground);
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .input-field:focus, .textarea-field:focus {
          outline: none;
          border-color: var(--primary);
        }

        .textarea-field {
          resize: vertical;
          line-height: 1.6;
        }

        .email-preview-card {
          background-color: #fff;
          color: #171717;
          border-radius: 0.5rem;
          padding: 1.5rem;
          height: fit-content;
          border: 1px solid var(--card-border);
        }

        .email-header {
          border-bottom: 1px solid #e5e5e5;
          padding-bottom: 1rem;
          margin-bottom: 1rem;
        }

        .meta-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
          font-size: 0.875rem;
        }

        .label {
          color: #666;
          font-weight: 500;
        }

        .value {
          color: #171717;
        }

        .email-body {
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        .email-line {
          min-height: 1.5em;
        }

        .action-row {
          display: flex;
          justify-content: flex-end;
        }

        .secondary-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: 1px solid var(--card-border);
          color: var(--foreground);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
        }
        
        .icon-btn {
           background: none;
           border: none;
           color: var(--muted);
           cursor: pointer;
        }
        
        .icon-btn:hover {
          color: var(--foreground);
        }
      `}</style>
        </div>
    );
}
