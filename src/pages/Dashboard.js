import React from 'react';

const DashboardPage = ({ edge, nodes, monitoringData }) => {
    const nodeFrom = nodes.find(n => n.id === edge.from);
    const nodeTo = nodes.find(n => n.id === edge.to);

    // Default to a healthy state object if data is not yet available
    const dataFrom = monitoringData[nodeFrom?.twid] || { Phase_R: 'Healthy', Phase_Y: 'Healthy', Phase_B: 'Healthy', lastSeen: null };
    const dataTo = monitoringData[nodeTo?.twid] || { Phase_R: 'Healthy', Phase_Y: 'Healthy', Phase_B: 'Healthy', lastSeen: null };

    // Icons for status
    const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
    const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;

    const PhaseStatusCard = ({ phaseName, fromData, toData }) => {
        const statusFrom = fromData[`Phase_${phaseName}`] || 'Healthy';
        const statusTo = toData[`Phase_${phaseName}`] || 'Healthy';
        const isOverallFault = statusFrom === 'Fault' || statusTo === 'Fault';

        const StatusDisplay = ({ status }) => (
            <div className={`phase-detail-status ${status === 'Healthy' ? 'status-healthy' : 'status-fault'}`}>
                {status === 'Healthy' ? <CheckCircleIcon /> : <XCircleIcon />}
                <span>{status}</span>
            </div>
        );

        return (
            <div className={`phase-card ${isOverallFault ? 'phase-card-fault' : ''}`}>
                <h3 className="phase-card-title">{`Phase-${phaseName}`}</h3>
                <div className="phase-detail-grid">
                    <div className="phase-detail-item">
                        <p>{nodeFrom?.twid || 'N/A'}</p>
                        <StatusDisplay status={statusFrom} />
                    </div>
                    <div className="phase-detail-item">
                        <p>{nodeTo?.twid || 'N/A'}</p>
                        <StatusDisplay status={statusTo} />
                    </div>
                </div>
            </div>
        );
    };

    const EventLogTable = () => {
        // Placeholder for future log implementation
        const mockLogs = [
            { timestamp: new Date(Date.now() - 2 * 60 * 1000).toLocaleString(), phase: 'Phase-R', status: 'Fault' },
            { timestamp: new Date(Date.now() - 5 * 60 * 1000).toLocaleString(), phase: 'Phase-R', status: 'Healthy' },
        ];

        return (
            <div className="event-log-container">
              <h2 className="event-log-title">Historical Event Logs (Placeholder)</h2>
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                <table className="event-log-table">
                  <thead><tr><th>Timestamp</th><th>Phase</th><th>Status</th></tr></thead>
                  <tbody>
                    {mockLogs.map((log, index) => (
                      <tr key={index}>
                        <td>{log.timestamp}</td>
                        <td>{log.phase}</td>
                        <td><span className={`log-status-badge ${log.status === 'Healthy' ? 'log-status-healthy' : 'log-status-fault'}`}>{log.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'N/A';
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
        const minutes = Math.floor(seconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    };

    const lastUpdateTime = Math.max(dataFrom.lastSeen, dataTo.lastSeen);
    
    return (
        <main className="container">
            <div className="dashboard-header">
                <h1 className="page-title">Phase Monitoring</h1>
                <p>Status for power line between <strong>{edge.from}</strong> ({nodeFrom?.twid}) and <strong>{edge.to}</strong> ({nodeTo?.twid}).</p>
            </div>
            <div className="status-grid">
                {['R', 'Y', 'B'].map((phase) => (
                    <PhaseStatusCard key={phase} phaseName={phase} fromData={dataFrom} toData={dataTo} />
                ))}
            </div>
            <EventLogTable />
            <div className="dashboard-footer">
                <p>Last data received: {formatTimeAgo(lastUpdateTime)}</p>
            </div>
        </main>
    );
};

export default DashboardPage;

