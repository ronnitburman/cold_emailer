"use client";

import { useState, useEffect } from "react";
import { Mail, Reply, Eye, UserPlus, ArrowRight } from "lucide-react";
import { fetchData } from "@/lib/api";

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await fetchData("/activities");
      if (data) setActivities(data);
    }
    load();
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'reply': return Reply;
      case 'open': return Eye;
      case 'sent': return Mail;
      case 'new_contact': return UserPlus;
      default: return Mail;
    }
  };

  return (
    <div className="activity-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Recent Activity</h3>
          <p className="card-subtitle">Live updates from your campaigns</p>
        </div>
      </div>

      <div className="activity-list">
        {activities.map((item) => {
          const Icon = getIcon(item.type);
          return (
            <div key={item.id} className="activity-item">
              <div
                className="activity-icon"
                style={{ color: item.color, backgroundColor: item.bg }}
              >
                <Icon size={16} />
              </div>

              <div className="activity-content">
                <div className="activity-header">
                  <span className="user-name">{item.user}</span>
                  <span className="action-text"> {item.action}</span>
                </div>
                <div className="campaign-name">{item.campaign}</div>
              </div>

              <span className="time-ago">{item.time}</span>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .activity-card {
          background-color: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 1.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .card-header {
          margin-bottom: 1.5rem;
        }

        .card-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--foreground);
          margin-bottom: 0.25rem;
        }

        .card-subtitle {
          font-size: 0.875rem;
          color: var(--muted);
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
          flex: 1;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .activity-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .activity-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
        }

        .activity-header {
          font-size: 0.875rem;
          margin-bottom: 0.125rem;
        }

        .user-name {
          font-weight: 600;
          color: var(--foreground);
        }

        .action-text {
          color: var(--muted);
        }

        .campaign-name {
          font-size: 0.75rem;
          color: var(--muted);
        }

        .time-ago {
          font-size: 0.75rem;
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}
