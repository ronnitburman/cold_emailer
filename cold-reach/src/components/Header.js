"use client";

import { Search, Bell, Plus } from "lucide-react";
import Link from "next/link";

export default function Header() {
    return (
        <header className="header">
            <div className="search-container">
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    placeholder="Search campaigns, contacts..."
                    className="search-input"
                />
            </div>

            <div className="actions">
                <Link href="/campaigns/new" className="new-campaign-btn">
                    <Plus size={16} />
                    <span>New Campaign</span>
                </Link>
                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="notification-dot">3</span>
                </button>
                <div className="user-avatar">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                </div>
            </div>

            <style jsx>{`
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 2rem;
        }

        .search-container {
          position: relative;
          width: 320px;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
        }

        .search-input {
          width: 100%;
          background-color: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.5rem;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          color: var(--foreground);
          font-size: 0.875rem;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--muted);
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .new-campaign-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: var(--foreground);
          color: var(--background);
          padding: 0.6rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .new-campaign-btn:hover {
          opacity: 0.9;
        }

        .icon-btn {
          background: none;
          border: none;
          color: var(--muted);
          position: relative;
          cursor: pointer;
        }

        .icon-btn:hover {
          color: var(--foreground);
        }

        .notification-dot {
          position: absolute;
          top: -5px;
          right: -5px;
          background-color: #3b82f6; /* Blue for notification */
          color: white;
          font-size: 10px;
          font-weight: bold;
          min-width: 16px;
          height: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--background);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background-color: var(--card-border);
        }
        
        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
        </header>
    );
}
