import { useState, useEffect } from "react";
import { MoreHorizontal, Play, Pause, Sheet, Database, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { fetchAuthenticatedData, fetchData } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function CampaignTable() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState("none");
  const [sheetsConnected, setSheetsConnected] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function load() {
      let data;

      // Use authenticated endpoint if user is logged in
      if (isAuthenticated) {
        data = await fetchAuthenticatedData("/campaigns");
      } else {
        // Non-authenticated users see nothing until they try demo
        data = { campaigns: [], source: "none", sheets_connected: 0 };
      }

      if (data) {
        // Handle new response format
        if (data.campaigns) {
          setCampaigns(data.campaigns);
          setDataSource(data.source || "none");
          setSheetsConnected(data.sheets_connected || 0);
        } else if (Array.isArray(data)) {
          // Fallback for old format
          setCampaigns(data);
        }
      }
      setLoading(false);
    }
    load();
  }, [isAuthenticated]);

  // Load demo data when "Try Demo" is clicked
  const loadDemoData = async () => {
    setLoading(true);
    const data = await fetchData("/campaigns/demo");
    if (data && data.campaigns) {
      setCampaigns(data.campaigns);
      setDataSource("demo");
      setDemoMode(true);
    }
    setLoading(false);
  };

  // Exit demo mode and reload real data
  const exitDemoMode = async () => {
    setDemoMode(false);
    setLoading(true);
    if (isAuthenticated) {
      const data = await fetchAuthenticatedData("/campaigns");
      if (data) {
        setCampaigns(data.campaigns || []);
        setDataSource(data.source || "none");
        setSheetsConnected(data.sheets_connected || 0);
      }
    } else {
      setCampaigns([]);
      setDataSource("none");
    }
    setLoading(false);
  };

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
          <p className="card-subtitle">
            {dataSource === "sheets" ? (
              <>
                <Sheet size={12} style={{ display: "inline", marginRight: 4 }} />
                Synced from {sheetsConnected} Google Sheet{sheetsConnected !== 1 ? 's' : ''}
              </>
            ) : dataSource === "demo" ? (
              <>
                <Database size={12} style={{ display: "inline", marginRight: 4 }} />
                Demo data preview
                <button onClick={exitDemoMode} className="exit-demo-link">
                  Exit demo
                </button>
              </>
            ) : (
              "Track performance across all your campaigns"
            )}
          </p>
        </div>
        <Link href="/campaigns/new" className="new-btn">
          New Campaign
        </Link>
      </div>

      {/* Empty state - show when no campaigns and not in demo mode */}
      {campaigns.length === 0 && !loading && !demoMode && (
        <div className="empty-state">
          <FileSpreadsheet size={48} className="empty-icon" />
          <h4 className="empty-title">No campaigns yet</h4>
          <p className="empty-text">
            {isAuthenticated
              ? "Connect a Google Sheet to import your campaigns, or try the demo to see how it works."
              : "Sign in to connect your Google Sheets, or try the demo to see sample data."}
          </p>
          <div className="empty-actions">
            <button onClick={loadDemoData} className="demo-btn">
              Try Demo
            </button>
            {isAuthenticated && (
              <Link href="/sheets" className="connect-btn">
                Connect Sheet
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Table - show when there are campaigns */}
      {campaigns.length > 0 && (
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
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading-state">
          <p>Loading campaigns...</p>
        </div>
      )}

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

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          text-align: center;
        }

        .empty-icon {
          color: var(--muted);
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-title {
          color: var(--foreground);
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .empty-text {
          color: var(--muted);
          font-size: 0.875rem;
          max-width: 320px;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .empty-actions {
          display: flex;
          gap: 0.75rem;
        }

        .demo-btn {
          background: rgba(255, 255, 255, 0.1);
          color: var(--foreground);
          border: 1px solid var(--card-border);
          padding: 0.625rem 1.25rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .demo-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .connect-btn {
          background: var(--accent-green);
          color: var(--background);
          padding: 0.625rem 1.25rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .connect-btn:hover {
          opacity: 0.9;
        }

        .exit-demo-link {
          background: none;
          border: none;
          color: var(--accent-green);
          font-size: 0.875rem;
          cursor: pointer;
          margin-left: 0.5rem;
          padding: 0;
          text-decoration: underline;
        }

        .exit-demo-link:hover {
          opacity: 0.8;
        }

        .loading-state {
          display: flex;
          justify-content: center;
          padding: 2rem;
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}
