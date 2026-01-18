"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Send, Users, FileText, BarChart2, Settings, Mail } from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Campaigns", href: "/campaigns", icon: Send },
        { name: "Contacts", href: "/contacts", icon: Users },
        { name: "Templates", href: "/templates", icon: FileText },
        { name: "Analytics", href: "/analytics", icon: BarChart2 },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <aside className="sidebar">
            <div className="logo-section">
                <Mail className="logo-icon" size={24} />
                <span className="logo-text">ColdReach</span>
            </div>

            <nav className="nav-menu">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${isActive ? "active" : ""}`}
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="user-profile">
                {/* Placeholder user profile */}
                <div className="avatar">RB</div>
                <div className="user-info">
                    <p className="user-name">Ronnit Burman</p>
                    <p className="user-role">Admin</p>
                </div>
            </div>

            <style jsx>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          background-color: var(--background);
          border-right: 1px solid var(--card-border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          padding: 1.5rem;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
          color: var(--foreground);
        }

        .logo-icon {
          color: var(--foreground);
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.025em;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          color: var(--muted);
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          color: var(--foreground);
          background-color: rgba(255, 255, 255, 0.05);
        }

        .nav-item.active {
          color: var(--foreground);
          background-color: rgba(255, 255, 255, 0.1);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--card-border);
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--card-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--foreground);
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--foreground);
        }

        .user-role {
          font-size: 0.75rem;
          color: var(--muted);
        }
      `}</style>
        </aside>
    );
}
