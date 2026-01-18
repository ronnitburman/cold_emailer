"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, Settings, User, ChevronDown, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function UserMenu() {
    const { user, logout, logoutAll } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);
    const router = useRouter();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    const handleLogoutAll = async () => {
        await logoutAll();
        router.push("/");
    };

    if (!user) return null;

    return (
        <div className="user-menu-container" ref={menuRef}>
            <button 
                className="user-menu-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="user-avatar">
                    {user.picture ? (
                        <img src={user.picture} alt={user.name || "User"} />
                    ) : (
                        <span>{user.name?.[0] || user.email?.[0] || "U"}</span>
                    )}
                </div>
                <div className="user-info">
                    <span className="user-name">{user.name || "User"}</span>
                    <span className="user-email">{user.email}</span>
                </div>
                <ChevronDown 
                    size={16} 
                    className={`chevron ${isOpen ? "open" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="user-menu-dropdown">
                    <div className="menu-section">
                        <button className="menu-item">
                            <User size={16} />
                            <span>Profile</span>
                        </button>
                        <button className="menu-item">
                            <Settings size={16} />
                            <span>Settings</span>
                        </button>
                    </div>
                    <div className="menu-divider" />
                    <div className="menu-section">
                        <button className="menu-item" onClick={handleLogout}>
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </button>
                        <button className="menu-item danger" onClick={handleLogoutAll}>
                            <Shield size={16} />
                            <span>Sign Out All Devices</span>
                        </button>
                    </div>
                </div>
            )}

            <style jsx>{`
                .user-menu-container {
                    position: relative;
                }

                .user-menu-trigger {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 0.75rem;
                    background: transparent;
                    border: 1px solid var(--card-border);
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: var(--foreground);
                }

                .user-menu-trigger:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--card-bg);
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

                .user-info {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    text-align: left;
                }

                .user-name {
                    font-size: 0.875rem;
                    font-weight: 600;
                }

                .user-email {
                    font-size: 0.75rem;
                    color: var(--muted);
                }

                .chevron {
                    color: var(--muted);
                    transition: transform 0.2s;
                }

                .chevron.open {
                    transform: rotate(180deg);
                }

                .user-menu-dropdown {
                    position: absolute;
                    top: calc(100% + 0.5rem);
                    right: 0;
                    min-width: 220px;
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: 0.75rem;
                    padding: 0.5rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    z-index: 100;
                    animation: slideDown 0.2s ease;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .menu-section {
                    display: flex;
                    flex-direction: column;
                }

                .menu-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.625rem 0.75rem;
                    border: none;
                    background: transparent;
                    color: var(--foreground);
                    font-size: 0.875rem;
                    cursor: pointer;
                    border-radius: 0.375rem;
                    transition: background 0.2s;
                    text-align: left;
                    width: 100%;
                }

                .menu-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .menu-item.danger {
                    color: var(--accent-red);
                }

                .menu-item.danger:hover {
                    background: var(--accent-red-bg);
                }

                .menu-divider {
                    height: 1px;
                    background: var(--card-border);
                    margin: 0.5rem 0;
                }
            `}</style>
        </div>
    );
}
