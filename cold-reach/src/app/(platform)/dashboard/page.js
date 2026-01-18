"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import CampaignTable from "@/components/CampaignTable";
import RecentActivity from "@/components/RecentActivity";
import { fetchData } from "@/lib/api";

export default function Home() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await fetchData("/stats");
      if (data) setStats(data);
    }
    load();
  }, []);

  return (
    <div className="dashboard-container">
      <Header />

      <div className="section-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Track your outreach performance and manage campaigns</p>
      </div>

      <div className="stats-grid">
        {stats.length > 0 ? (
          stats.map((stat, i) => (
            <StatCard
              key={i}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              trend={stat.trend}
              iconName={stat.iconName}
            />
          ))
        ) : (
          // Fallback/Loading state (optional, or just show empty)
          <>
            <StatCard title="Emails Sent" value="-" change="-" />
            <StatCard title="Total Contacts" value="-" change="-" />
            <StatCard title="Open Rate" value="-" change="-" />
            <StatCard title="Reply Rate" value="-" change="-" />
          </>
        )}
      </div>

      <div className="content-grid">
        <div className="main-col">
          <CampaignTable />
        </div>
        <div className="side-col">
          <RecentActivity />
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-header {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--foreground);
          margin-bottom: 0.5rem;
        }

        .page-subtitle {
          color: var(--muted);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        @media (min-width: 1024px) {
          .content-grid {
            grid-template-columns: 2fr 1fr; /* 2/3 for campaigns, 1/3 for activity */
          }
        }
      `}</style>
    </div>
  );
}
