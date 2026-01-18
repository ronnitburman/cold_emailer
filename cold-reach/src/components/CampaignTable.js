import { useState, useEffect } from "react";
import { MoreHorizontal, Play, Pause } from "lucide-react";
import Link from "next/link";
import { fetchData } from "@/lib/api";

export default function CampaignTable() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchData("/campaigns");
      if (data) setCampaigns(data);
      setLoading(false);
    }
    load();
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active": return "var(--accent-green)";
      case "paused": return "#8b5cf6"; // violet
      case "draft": return "var(--muted)";
      default: return "var(--muted)";
    }
  };


  const getStatusBg = (status) => {
    switch (status.toLowerCase()) {
      case "active": return "var(--accent-green-bg)";
      case "paused": return "rgba(139, 92, 246, 0.1)";
      case "draft": return "rgba(255, 255, 255, 0.05)";
      default: return "rgba(255, 255, 255, 0.05)";
    }
  };

  return (
    <div className="campaign-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Recent Campaigns</h3>
          <p className="card-subtitle">Track performance across all your campaigns</p>
        </div>
        <Link href="/campaigns/new" className="new-btn">
          New Campaign
        </Link>
      </div>

      <div className="table-container">
        <table className="campaign-table">
          <thead>
            <tr>
              <th className="th-left">CAMPAIGN</th>
              <th>STATUS</th>
              <th>SENT</th>
              <th>OPEN RATE</th>
              <th>REPLY RATE</th>
              <th className="th-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((camp) => (
              <tr key={camp.id}>
                <td className="name-cell">{camp.name}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{
                      color: getStatusColor(camp.status),
                      backgroundColor: getStatusBg(camp.status),
                      borderColor: camp.status === 'Draft' ? 'var(--card-border)' : 'transparent'
                    }}
                  >
                    {camp.status}
                  </span>
                </td>
                <td>{camp.sent}</td>
                <td>{camp.openRate}</td>
                <td>{camp.replyRate}</td>
                <td className="actions-cell">
                  {camp.status === 'Active' ? (
                    <button className="icon-btn"><Pause size={16} /></button>
                  ) : camp.status === 'Paused' ? (
                    <button className="icon-btn"><Play size={16} /></button>
                  ) : (
                    <div className="spacer"></div>
                  )}
                  <button className="icon-btn"><MoreHorizontal size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .campaign-card {
          background-color: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        .new-btn {
          background-color: var(--foreground);
          color: var(--background);
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          transition: opacity 0.2s;
        }

        .new-btn:hover {
          opacity: 0.9;
        }

        .table-container {
          overflow-x: auto;
        }

        .campaign-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }

        th {
          text-align: left;
          color: var(--muted);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--card-border);
        }
        
        .th-right { text-align: right; }
        .th-left { padding-left: 0.5rem; }

        td {
          padding: 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: var(--muted);
        }

        tr:last-child td {
          border-bottom: none;
        }

        .name-cell {
          color: var(--foreground);
          font-weight: 500;
          padding-left: 0.5rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          border: 1px solid transparent;
        }

        .actions-cell {
          text-align: right;
          white-space: nowrap;
        }

        .icon-btn {
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 0.25rem;
          transition: color 0.2s;
          margin-left: 0.5rem;
        }

        .icon-btn:hover {
          color: var(--foreground);
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .spacer {
          display: inline-block;
          width: 24px; 
        }
      `}</style>
    </div>
  );
}
