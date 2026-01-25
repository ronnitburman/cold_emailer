"use client";

import { useState } from "react";
import { Settings, Sheet, User, Bell, Shield } from "lucide-react";
import GoogleSheetsManager from "@/components/GoogleSheetsManager";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("integrations");

    const tabs = [
        { id: "integrations", label: "Integrations", icon: Sheet },
        { id: "profile", label: "Profile", icon: User },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: Shield },
    ];

    return (
        <div className="settings-page">
            <div className="settings-header">
                <Settings size={24} />
                <div>
                    <h1>Settings</h1>
                    <p>Manage your account and integrations</p>
                </div>
            </div>

            <div className="settings-layout">
                <nav className="settings-nav">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="settings-content">
                    {activeTab === "integrations" && (
                        <div className="settings-section">
                            <GoogleSheetsManager />
                            
                            <div className="integration-info">
                                <h4>How to connect Google Sheets</h4>
                                <ol>
                                    <li>Create or open your campaigns spreadsheet in Google Sheets</li>
                                    <li>Ensure your sheet has columns like: <strong>Name</strong>, <strong>Status</strong>, <strong>Sent</strong>, <strong>Open Rate</strong>, <strong>Reply Rate</strong></li>
                                    <li>Share the sheet with the service account email (ask your admin for the email)</li>
                                    <li>Copy the sheet URL and paste it above</li>
                                    <li>Click "Validate" to check access, then "Connect Sheet"</li>
                                </ol>
                            </div>
                        </div>
                    )}

                    {activeTab === "profile" && (
                        <div className="settings-section">
                            <h3>Profile Settings</h3>
                            <p className="coming-soon">Profile management coming soon...</p>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="settings-section">
                            <h3>Notification Preferences</h3>
                            <p className="coming-soon">Notification settings coming soon...</p>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="settings-section">
                            <h3>Security Settings</h3>
                            <p className="coming-soon">Security settings coming soon...</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .settings-page {
                    max-width: 1000px;
                    margin: 0 auto;
                }

                .settings-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .settings-header h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 0.25rem;
                }

                .settings-header p {
                    color: var(--muted);
                    font-size: 0.9375rem;
                }

                .settings-layout {
                    display: grid;
                    grid-template-columns: 200px 1fr;
                    gap: 2rem;
                }

                .settings-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    background: transparent;
                    border: none;
                    border-radius: 0.5rem;
                    color: var(--muted);
                    font-size: 0.9375rem;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.2s;
                }

                .nav-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--foreground);
                }

                .nav-item.active {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--foreground);
                }

                .settings-content {
                    min-height: 400px;
                }

                .settings-section h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }

                .coming-soon {
                    color: var(--muted);
                    font-style: italic;
                }

                .integration-info {
                    margin-top: 1.5rem;
                    padding: 1.25rem;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--card-border);
                    border-radius: 0.75rem;
                }

                .integration-info h4 {
                    font-size: 0.9375rem;
                    font-weight: 600;
                    margin-bottom: 1rem;
                }

                .integration-info ol {
                    padding-left: 1.25rem;
                    color: var(--muted);
                    font-size: 0.875rem;
                    line-height: 1.8;
                }

                .integration-info strong {
                    color: var(--foreground);
                }

                @media (max-width: 768px) {
                    .settings-layout {
                        grid-template-columns: 1fr;
                    }

                    .settings-nav {
                        flex-direction: row;
                        overflow-x: auto;
                    }

                    .nav-item {
                        white-space: nowrap;
                    }
                }
            `}</style>
        </div>
    );
}
