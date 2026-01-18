"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SignInModal({ isOpen, onClose }) {
    const { signInWithGoogle, signInWithApple } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
        } catch (err) {
            setError("Failed to initialize Google Sign In. Please try again.");
            setIsLoading(false);
        }
    };

    const handleAppleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signInWithApple();
        } catch (err) {
            setError("Failed to initialize Apple Sign In. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={20} />
                </button>
                
                <div className="modal-header">
                    <h2>Welcome to ColdReach</h2>
                    <p>Sign in to manage your cold email campaigns</p>
                </div>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <div className="auth-buttons">
                    <button 
                        className="auth-btn google"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
                    </button>

                    <button 
                        className="auth-btn apple"
                        onClick={handleAppleSignIn}
                        disabled={isLoading}
                    >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                        </svg>
                        <span>{isLoading ? "Signing in..." : "Continue with Apple"}</span>
                    </button>
                </div>

                <div className="auth-terms">
                    By continuing, you agree to our{" "}
                    <a href="/terms">Terms of Service</a> and{" "}
                    <a href="/privacy">Privacy Policy</a>
                </div>

                <style jsx>{`
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.8);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        backdrop-filter: blur(4px);
                    }

                    .modal-content {
                        background: var(--card-bg);
                        border: 1px solid var(--card-border);
                        border-radius: 1rem;
                        padding: 2.5rem;
                        width: 100%;
                        max-width: 420px;
                        position: relative;
                        animation: slideUp 0.3s ease;
                    }

                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .modal-close {
                        position: absolute;
                        top: 1rem;
                        right: 1rem;
                        background: transparent;
                        border: none;
                        color: var(--muted);
                        cursor: pointer;
                        padding: 0.5rem;
                        border-radius: 0.5rem;
                        transition: all 0.2s;
                    }

                    .modal-close:hover {
                        background: rgba(255, 255, 255, 0.1);
                        color: var(--foreground);
                    }

                    .modal-header {
                        text-align: center;
                        margin-bottom: 2rem;
                    }

                    .modal-header h2 {
                        font-size: 1.5rem;
                        font-weight: 700;
                        margin-bottom: 0.5rem;
                    }

                    .modal-header p {
                        color: var(--muted);
                        font-size: 0.9375rem;
                    }

                    .auth-error {
                        background: var(--accent-red-bg);
                        color: var(--accent-red);
                        padding: 0.75rem 1rem;
                        border-radius: 0.5rem;
                        font-size: 0.875rem;
                        margin-bottom: 1.5rem;
                        text-align: center;
                    }

                    .auth-buttons {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .auth-btn {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 0.75rem;
                        width: 100%;
                        padding: 0.875rem 1.5rem;
                        border-radius: 0.75rem;
                        font-size: 0.9375rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s;
                        border: 1px solid var(--card-border);
                    }

                    .auth-btn:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                    }

                    .auth-btn.google {
                        background: var(--foreground);
                        color: var(--background);
                    }

                    .auth-btn.google:hover:not(:disabled) {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
                    }

                    .auth-btn.apple {
                        background: transparent;
                        color: var(--foreground);
                    }

                    .auth-btn.apple:hover:not(:disabled) {
                        background: rgba(255, 255, 255, 0.05);
                    }

                    .auth-terms {
                        margin-top: 2rem;
                        text-align: center;
                        font-size: 0.8125rem;
                        color: var(--muted);
                    }

                    .auth-terms a {
                        color: var(--foreground);
                        text-decoration: underline;
                        text-underline-offset: 2px;
                    }

                    .auth-terms a:hover {
                        color: var(--primary);
                    }
                `}</style>
            </div>
        </div>
    );
}
