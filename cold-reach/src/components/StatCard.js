"use client";

import { ArrowUpRight, ArrowDownRight, Mail, Users, BarChart2, CornerUpRight } from "lucide-react";

export default function StatCard({ title, value, change, trend, iconName }) {
    const isPositive = trend === "up";

    const icons = {
        mail: Mail,
        users: Users,
        chart: BarChart2,
        reply: CornerUpRight
    };

    const Icon = icons[iconName] || Mail;

    return (
        <div className="stat-card">
            <div className="card-header">
                <span className="card-title">{title}</span>
                <div className="icon-wrapper">
                    <Icon size={18} />
                </div>
            </div>

            <div className="card-content">
                <div className="value">{value}</div>
                <div className={`change ${isPositive ? "positive" : "negative"}`}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span className="change-value">{change}</span>
                    <span className="period">vs last month</span>
                </div>
            </div>

            <style jsx>{`
        .stat-card {
          background-color: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .card-title {
          color: var(--muted);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .icon-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 0.5rem;
          background-color: rgba(255, 255, 255, 0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          border: 1px solid var(--card-border);
        }

        .value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 0.5rem;
          line-height: 1;
        }

        .change {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .positive {
          color: var(--accent-green);
        }

        .negative {
          color: var(--accent-red);
        }

        .period {
          color: var(--muted);
          margin-left: 0.25rem;
        }
      `}</style>
        </div>
    );
}
