"use client";

import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserMenu from "@/components/UserMenu";

export default function PlatformLayout({ children }) {
    return (
        <ProtectedRoute>
            <div className="platform-container">
                <Sidebar />
                <div className="main-wrapper">
                    <header className="platform-header">
                        <div className="header-spacer" />
                        <UserMenu />
                    </header>
                    <main className="main-content">
                        {children}
                    </main>
                </div>
                <style jsx global>{`
                    .platform-container {
                        display: flex;
                        min-height: 100vh;
                    }
                    .main-wrapper {
                        flex: 1;
                        margin-left: var(--sidebar-width);
                        width: calc(100% - var(--sidebar-width));
                        display: flex;
                        flex-direction: column;
                    }
                    .platform-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1rem 2rem;
                        border-bottom: 1px solid var(--card-border);
                        background: var(--background);
                        position: sticky;
                        top: 0;
                        z-index: 10;
                    }
                    .header-spacer {
                        flex: 1;
                    }
                    .main-content {
                        flex: 1;
                        padding: 2rem;
                    }
                `}</style>
            </div>
        </ProtectedRoute>
    );
}
