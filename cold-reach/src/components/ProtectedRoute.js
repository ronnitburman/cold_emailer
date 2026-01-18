"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading...</p>
                
                <style jsx>{`
                    .loading-container {
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        background: var(--background);
                    }

                    .spinner {
                        width: 48px;
                        height: 48px;
                        border: 3px solid var(--card-border);
                        border-top-color: var(--foreground);
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 1rem;
                    }

                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }

                    p {
                        color: var(--muted);
                    }
                `}</style>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return children;
}
