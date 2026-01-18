"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AppleCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { handleOAuthCallback } = useAuth();
    const [error, setError] = useState(null);

    useEffect(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");

        if (errorParam) {
            setError(`Authentication failed: ${errorParam}`);
            return;
        }

        if (code && state) {
            handleOAuthCallback("apple", code, state)
                .then(() => {
                    router.push("/dashboard");
                })
                .catch((err) => {
                    setError(err.message || "Authentication failed");
                });
        } else {
            setError("Missing authentication parameters");
        }
    }, [searchParams, handleOAuthCallback, router]);

    return (
        <div className="callback-container">
            {error ? (
                <div className="callback-error">
                    <h2>Sign In Failed</h2>
                    <p>{error}</p>
                    <button onClick={() => router.push("/")}>
                        Return to Home
                    </button>
                </div>
            ) : (
                <div className="callback-loading">
                    <div className="spinner"></div>
                    <p>Completing sign in...</p>
                </div>
            )}

            <style jsx>{`
                .callback-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--background);
                }

                .callback-loading {
                    text-align: center;
                }

                .spinner {
                    width: 48px;
                    height: 48px;
                    border: 3px solid var(--card-border);
                    border-top-color: var(--foreground);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .callback-loading p {
                    color: var(--muted);
                    font-size: 1rem;
                }

                .callback-error {
                    text-align: center;
                    padding: 2rem;
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: 1rem;
                    max-width: 400px;
                }

                .callback-error h2 {
                    color: var(--accent-red);
                    margin-bottom: 0.5rem;
                }

                .callback-error p {
                    color: var(--muted);
                    margin-bottom: 1.5rem;
                }

                .callback-error button {
                    padding: 0.75rem 1.5rem;
                    background: var(--foreground);
                    color: var(--background);
                    border: none;
                    border-radius: 0.5rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .callback-error button:hover {
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    );
}
