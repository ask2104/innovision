import React, { useState, useEffect, useCallback } from 'react';
// Step 1: Import all necessary Firebase functions
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, remove } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcInnE8iaHFwBJhDDynBhDsYdwTyULLhI",
  authDomain: "innovision-6835e.firebaseapp.com",
  databaseURL: "https://innovision-6835e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "innovision-6835e",
  storageBucket: "innovision-6835e.appspot.com",
  messagingSenderId: "244864762149",
  appId: "1:244864762149:web:d07c63af7d5760ef03dacc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app); // Initialize Firebase Auth

// --- Style Component (No changes here) ---
const StyleProvider = () => {
    const styles = `
    :root {
      --slate-900: #0f172a; --slate-800: #1e293b; --slate-700: #334155;
      --slate-500: #64748b; --slate-400: #94a3b8; --slate-300: #cbd5e1;
      --slate-200: #e2e8f0; --yellow-400: #facc15; --blue-400: #60a5fa;
      --green-400: #4ade80; --red-400: #f87171;
    }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased; background-color: var(--slate-900); color: var(--slate-200); }
    .App { min-height: 100vh; width: 100%; }
    .container { width: 90%; max-width: 1280px; margin: 0 auto; padding: 1.5rem 0; }
    .navbar { background-color: var(--slate-800); padding: 1rem 0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    .nav-content { display: flex; align-items: center; justify-content: space-between; width: 90%; max-width: 1280px; margin: 0 auto; }
    .nav-brand { display: flex; align-items: center; gap: 0.75rem; font-size: 1.5rem; font-weight: bold; color: white; cursor: pointer; }
    .network-container { position: relative; width: 100%; height: 70vh; background-color: rgba(30, 41, 59, 0.5); border: 1px solid var(--slate-700); border-radius: 0.5rem; margin-top: 1.5rem; overflow: hidden; }
    .network-node { position: absolute; width: 2.5rem; height: 2.5rem; color: var(--slate-900); border-radius: 9999px; display: flex; align-items: center; justify-content: center; font-weight: bold; cursor: grab; transition: transform 0.2s, box-shadow 0.2s, border 0.2s, background-color 0.3s; z-index: 10; border: 3px solid transparent; user-select: none; }
    .network-node-online { background-color: var(--yellow-400); }
    .network-node-offline { background-color: var(--slate-500); border-color: var(--slate-400); }
    .network-node:active { cursor: grabbing; transform: scale(1.1); z-index: 20; }
    .network-node:hover { transform: scale(1.2); }
    .network-node-editing { box-shadow: 0 0 20px var(--blue-400); border-color: var(--blue-400); transform: scale(1.2); cursor: pointer; }
    .node-tooltip { position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%); background-color: var(--slate-700); color: white; padding: 0.5rem 0.75rem; border-radius: 0.375rem; font-size: 0.875rem; white-space: nowrap; opacity: 0; transition: opacity 0.2s; pointer-events: none; text-align: center; }
    .node-tooltip strong { display: block; font-size: 1rem; }
    .network-node:hover .node-tooltip { opacity: 1; }
    .network-edge { stroke-width: 4; cursor: pointer; transition: stroke 0.3s ease, stroke-width 0.2s ease; }
    .network-edge:hover { stroke-width: 6; }
    .network-edge-healthy { stroke: var(--green-400); }
    .network-edge-fault { stroke: var(--red-400); }
    .edge-tooltip { position: fixed; background-color: var(--slate-800); color: white; padding: 0.5rem 0.75rem; border-radius: 0.375rem; font-size: 0.875rem; z-index: 100; pointer-events: none; border: 1px solid var(--slate-500); transform: translate(10px, 10px); }
    .edge-tooltip strong { font-weight: bold; color: var(--slate-200); }
    .edge-tooltip-healthy { color: var(--green-400); }
    .edge-tooltip-fault { color: var(--red-400); }
    .edit-mode-banner { background-color: var(--blue-400); color: var(--slate-900); padding: 1rem; border-radius: 0.5rem; text-align: center; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center; }
    .edit-mode-banner p { margin: 0; font-weight: bold; }
    .edit-mode-banner button { background-color: var(--slate-900); color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; border: none; cursor: pointer; }
    .info-page-container { background-color: rgba(30, 41, 59, 0.5); padding: 2rem; border-radius: 0.5rem; border: 1px solid var(--slate-700); margin-top: 1.5rem; }
    .page-title { font-size: 1.75rem; font-weight: bold; margin-top: 0; margin-bottom: 1.5rem; }
    .action-button { padding: 0.75rem 1.5rem; border: none; border-radius: 0.375rem; font-size: 1rem; font-weight: bold; cursor: pointer; }
    .info-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; }
    .info-label { font-weight: bold; color: var(--slate-400); }
    .actions-section { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--slate-700); display: flex; gap: 1rem; }
    .delete-button-initial { background-color: var(--red-400); color: white; }
    .delete-confirmation { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .delete-confirmation p { margin: 0; flex-basis: 100%; margin-bottom: 0.5rem; }
    .delete-button-confirm, .delete-button-cancel { padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; font-weight: bold; cursor: pointer; }
    .delete-button-confirm { background-color: var(--red-400); color: white; }
    .delete-button-cancel { background-color: var(--slate-500); color: white; }
    .status-grid { display: grid; grid-template-columns: repeat(1, 1fr); gap: 1.5rem; }
    .phase-card { padding: 1.5rem; border-radius: 0.5rem; background-color: rgba(30, 41, 59, 0.5); border: 1px solid var(--slate-700); }
    .phase-card-title { font-size: 1.5rem; font-weight: bold; margin-top: 0; }
    .phase-card-status-text { margin-top: 1rem; font-size: 2.25rem; font-weight: bold; }
    .phase-card-description { margin-top: 0.5rem; font-size: 0.875rem; color: var(--slate-400); }
    .status-healthy { color: var(--green-400); }
    .status-fault { color: var(--red-400); }
    .footer { text-align: center; padding: 1rem; margin-top: 2rem; font-size: 0.875rem; color: var(--slate-500); }
    `;
    return <style>{styles}</style>;
};

const ZapIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>);
const Navbar = ({ onNavigate }) => (<nav className="navbar"><div className="nav-content"><div className="nav-brand" onClick={() => onNavigate('main')}><ZapIcon className="header-icon" /><span>InnoVision</span></div></div></nav>);
const Footer = () => (<footer className="footer"><p>Built for Smart India Hackathon 2025. A cost-effective solution for a safer tomorrow.</p></footer>);

const MainPage = ({ nodes, edges, onNodeClick, onEdgeClick, monitoringData, editingNodeId, onToggleEdge, onFinishEditing, hoveredEdgeInfo, onEdgeHover, onEdgeLeave, onUpdateNodePosition }) => {
    const getNodeById = (id) => nodes.find(n => n.id === id);
    const [draggingNodeId, setDraggingNodeId] = useState(null);
    const containerRef = React.useRef(null);

    const handleNodeMouseDown = (e, nodeId) => { if (editingNodeId) return; e.preventDefault(); setDraggingNodeId(nodeId); };
    const handleMouseMove = useCallback((e) => { if (!draggingNodeId || !containerRef.current) return; const rect = containerRef.current.getBoundingClientRect(); let x = ((e.clientX - rect.left) / rect.width) * 100; let y = ((e.clientY - rect.top) / rect.height) * 100; onUpdateNodePosition(draggingNodeId, Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y))); }, [draggingNodeId, onUpdateNodePosition]);
    const handleMouseUp = useCallback(() => { setDraggingNodeId(null); }, []);
    
    useEffect(() => { if (draggingNodeId) { window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleMouseUp); } return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); }; }, [draggingNodeId, handleMouseMove, handleMouseUp]);

    const getEdgeStatus = (edge) => {
        const nodeA = getNodeById(edge.from);
        const nodeB = getNodeById(edge.to);
        const dataA = monitoringData[nodeA?.twid];
        const dataB = monitoringData[nodeB?.twid];
        if (!dataA || !dataB) return 'Healthy';
        const isFaulty = Object.values(dataA).includes('Fault') || Object.values(dataB).includes('Fault');
        return isFaulty ? 'Fault' : 'Healthy';
    };

    const isNodeOnline = (node) => {
        const data = monitoringData[node.twid];
        if (!data || !data.lastSeen) return false;
        const fiveMinutes = 5 * 60 * 1000;
        return (Date.now() - data.lastSeen) < fiveMinutes;
    };

    return (
        <div className="container">
            {editingNodeId && (<div className="edit-mode-banner"><p>Editing connections for {editingNodeId}. Click another tower to connect/disconnect.</p><button onClick={onFinishEditing}>Done</button></div>)}
            {!editingNodeId && <h1 className="page-title">Network Overview</h1>}
            <div className="network-container" ref={containerRef}>
                <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
                    <g>
                        {edges.map(edge => {
                            const nodeA = getNodeById(edge.from);
                            const nodeB = getNodeById(edge.to);
                            if (!nodeA || !nodeB) return null;
                            const status = getEdgeStatus(edge);
                            const edgeClass = `network-edge ${status === 'Fault' ? 'network-edge-fault' : 'network-edge-healthy'}`;
                            return (<line key={`${edge.from}-${edge.to}`} x1={`${nodeA.x}%`} y1={`${nodeA.y}%`} x2={`${nodeB.x}%`} y2={`${nodeB.y}%`} className={edgeClass} onClick={() => !editingNodeId && onEdgeClick(edge)} onMouseEnter={(e) => onEdgeHover(e, edge, status)} onMouseLeave={onEdgeLeave}/>);
                        })}
                    </g>
                </svg>
                {nodes.map(node => {
                    const isOnline = isNodeOnline(node);
                    return (
                    <div key={node.id} className={`network-node ${isOnline ? 'network-node-online' : 'network-node-offline'} ${editingNodeId === node.id ? 'network-node-editing' : ''}`} style={{ left: `calc(${node.x}% - 1.25rem)`, top: `calc(${node.y}% - 1.25rem)` }} onMouseDown={(e) => handleNodeMouseDown(e, node.id)} onClick={() => editingNodeId && onToggleEdge(node.id)} onDoubleClick={() => !editingNodeId && onNodeClick(node)}>
                        {node.id.replace('TW', '')}
                        <div className="node-tooltip"><strong>{node.id} ({isOnline ? 'Online' : 'Offline'})</strong><span>{node.location}</span></div>
                    </div>
                )})}
            </div>
            {hoveredEdgeInfo && (<div className="edge-tooltip" style={{ top: hoveredEdgeInfo.y, left: hoveredEdgeInfo.x }}><p><strong>{hoveredEdgeInfo.from} &harr; {hoveredEdgeInfo.to}</strong></p><p>Status: <span className={hoveredEdgeInfo.status === 'Fault' ? 'edge-tooltip-fault' : 'edge-tooltip-healthy'}>{hoveredEdgeInfo.status}</span></p></div>)}
        </div>
    );
};

const NodeInfoPage = ({ node, onDeleteNode, onStartEditConnections }) => {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    if (!node) return <div className="container"><p>Node not found.</p></div>;
    return (
        <div className="container">
             <div className="info-page-container">
                <h1 className="page-title">Tower Information: {node.id}</h1>
                <div className="info-grid">
                    <span className="info-label">Location:</span><span>{node.location}</span>
                    <span className="info-label">Coordinates:</span><span>{`${node.x.toFixed(2)}%, ${node.y.toFixed(2)}%`}</span>
                    <span className="info-label">Installation Date:</span><span>{node.installDate}</span>
                    <span className="info-label">Last Job Done:</span><span>{node.lastJob}</span>
                    <span className="info-label">TWID:</span><span>{node.twid}</span>
                </div>
                <div className="actions-section">
                    <button onClick={() => onStartEditConnections(node.id)} className="action-button">Edit Connections</button>
                    {!isConfirmingDelete ? (<button onClick={() => setIsConfirmingDelete(true)} className="action-button delete-button-initial">Delete Tower</button>) : (<div className="delete-confirmation"><p>Are you sure?</p><button onClick={() => onDeleteNode(node.id)} className="delete-button-confirm">Confirm Delete</button><button onClick={() => setIsConfirmingDelete(false)} className="delete-button-cancel">Cancel</button></div>)}
                </div>
            </div>
        </div>
    );
};

const DashboardPage = ({ edge, nodes, monitoringData }) => {
    const nodeFrom = nodes.find(n => n.id === edge.from);
    const nodeTo = nodes.find(n => n.id === edge.to);
    const dataFrom = monitoringData[nodeFrom?.twid] || {Phase_R: 'Healthy', Phase_Y: 'Healthy', Phase_B: 'Healthy'};
    const dataTo = monitoringData[nodeTo?.twid] || {Phase_R: 'Healthy', Phase_Y: 'Healthy', Phase_B: 'Healthy'};

    const phases = ['R', 'Y', 'B'].map(p => ({
        name: p,
        status: dataFrom[`Phase_${p}`] === 'Fault' || dataTo[`Phase_${p}`] === 'Fault' ? 'Fault' : 'Healthy'
    }));

    const PhaseStatusCard = ({ phaseName, status }) => (<div className="phase-card"><h3 className="phase-card-title">{`Phase-${phaseName}`}</h3><div className={`phase-card-status-text ${status === 'Healthy' ? 'status-healthy' : 'status-fault'}`}>{status}</div><p className="phase-card-description">{status === 'Healthy' ? 'Line is stable.' : 'Fault detected!'}</p></div>);
    
    return (<main className="container"><div className="dashboard-header"><h1 className="page-title">Phase Monitoring</h1><p>Status for power line between <strong>{edge.from}</strong> ({nodeFrom?.twid}) and <strong>{edge.to}</strong> ({nodeTo?.twid}).</p></div><div className="status-grid">{phases.map((phase) => <PhaseStatusCard key={phase.name} phaseName={phase.name} status={phase.status} />)}</div></main>);
};

export default function App() {
  const [page, setPage] = useState('main');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [monitoringData, setMonitoringData] = useState({});
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [editingNodeId, setEditingNodeId] = useState(null);
  const [hoveredEdgeInfo, setHoveredEdgeInfo] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthReady(true);
      } else {
        signInAnonymously(auth).catch((error) => console.error("Anonymous sign-in failed:", error));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    const nodesRef = ref(db, 'nodes/');
    const edgesRef = ref(db, 'edges/');
    const monitoringRef = ref(db, '3PhaseMonitoring/');

    const unsubscribeNodes = onValue(nodesRef, (snapshot) => { setNodes(snapshot.val() ? Object.values(snapshot.val()) : []); });
    const unsubscribeEdges = onValue(edgesRef, (snapshot) => { setEdges(snapshot.val() ? Object.values(snapshot.val()) : []); });
    
    // **MAIN LOGIC FOR AUTO-DISCOVERY**
    const unsubscribeMonitoring = onValue(monitoringRef, (snapshot) => {
        const rawData = snapshot.val();
        if (rawData) {
            const normalizedData = {};
            const poleTwids = Object.keys(rawData).map(key => key.replace('.json', ''));
            
            poleTwids.forEach(twid => {
                const key = `${twid}.json`;
                normalizedData[twid] = rawData[key] || rawData[twid]; // Handle both with/without .json
            });
            setMonitoringData(normalizedData);

            // **AUTO-ADD NODES LOGIC**
            // Use a function form of setNodes to get the most current state
            setNodes(currentNodes => {
                const existingTwids = currentNodes.map(n => n.twid);
                const newTwids = poleTwids.filter(twid => !existingTwids.includes(twid));

                if (newTwids.length > 0) {
                    console.log("New devices detected:", newTwids);
                    let lastNode = currentNodes.length > 0 ? [...currentNodes].sort((a,b) => a.id.localeCompare(b.id)).pop() : null;
                    
                    newTwids.forEach((newTwid, index) => {
                        const nextIdNumber = (lastNode ? parseInt(lastNode.id.replace('TW', '')) : 0) + index + 1;
                        const newNode = {
                            id: `TW${String(nextIdNumber).padStart(2, '0')}`,
                            twid: newTwid,
                            x: Math.random() * 80 + 10,
                            y: Math.random() * 80 + 10,
                            location: `${newTwid}`, // Set location to TWID
                            installDate: new Date().toISOString().split('T')[0],
                            lastJob: 'Auto-registered'
                        };
                        console.log("Creating new node:", newNode);
                        set(ref(db, `nodes/${newNode.id}`), newNode);

                        if (lastNode) {
                            const newEdge = { from: lastNode.id, to: newNode.id };
                            const edgeId = [newEdge.from, newEdge.to].sort().join('-');
                            console.log("Creating new edge:", newEdge);
                            set(ref(db, `edges/${edgeId}`), newEdge);
                        }
                        lastNode = newNode; // Chain the new nodes together
                    });
                }
                return currentNodes; // Return the old state for now, the listener will update it
            });
        } else {
            setMonitoringData({});
        }
    });

    return () => {
        unsubscribeNodes();
        unsubscribeEdges();
        unsubscribeMonitoring();
    };
  }, [isAuthReady]);

  const handleNavigate = (targetPage) => { setEditingNodeId(null); setPage(targetPage); };
  
  const handleNodeClick = (node) => { setSelectedNode(node); setPage('nodeInfo'); };
  const handleEdgeClick = (edge) => { setSelectedEdge(edge); setPage('dashboard'); };
  
  const handleDeleteNode = (nodeIdToDelete) => {
    const nodeToDelete = nodes.find(n => n.id === nodeIdToDelete);
    if(nodeToDelete && nodeToDelete.twid) {
        remove(ref(db, `3PhaseMonitoring/${nodeToDelete.twid}.json`));
        remove(ref(db, `3PhaseMonitoring/${nodeToDelete.twid}`));
    }
    remove(ref(db, `nodes/${nodeIdToDelete}`));
    edges.forEach(edge => {
        if (edge.from === nodeIdToDelete || edge.to === nodeIdToDelete) {
            const edgeId = [edge.from, edge.to].sort().join('-');
            remove(ref(db, `edges/${edgeId}`));
        }
    });
    if (editingNodeId === nodeIdToDelete) setEditingNodeId(null);
    setPage('main');
  };
  
  const handleStartEditConnections = (nodeId) => { setEditingNodeId(nodeId); setPage('main'); };
  const handleFinishEditing = () => setEditingNodeId(null);
  
  const handleToggleEdge = (targetNodeId) => {
    if (!editingNodeId || editingNodeId === targetNodeId) return;
    const edgeId = [editingNodeId, targetNodeId].sort().join('-');
    const edgeExists = edges.some(e => [e.from, e.to].sort().join('-') === edgeId);
    if (edgeExists) {
        remove(ref(db, `edges/${edgeId}`));
    } else {
        set(ref(db, `edges/${edgeId}`), { from: editingNodeId, to: targetNodeId });
    }
  };
  
  const handleEdgeHover = (e, edge, status) => setHoveredEdgeInfo({ x: e.clientX + 15, y: e.clientY + 15, from: edge.from, to: edge.to, status });
  const handleEdgeLeave = () => setHoveredEdgeInfo(null);
  
  const handleUpdateNodePosition = (nodeId, x, y) => {
    const nodeRef = ref(db, `nodes/${nodeId}`);
    const currentNode = nodes.find(n => n.id === nodeId);
    if (currentNode) {
        set(nodeRef, { ...currentNode, x, y });
    }
  };

  const renderPage = () => {
    const currentNode = nodes.find(n => n.id === selectedNode?.id) || selectedNode;
    switch (page) {
      case 'nodeInfo': return <NodeInfoPage node={currentNode} onDeleteNode={handleDeleteNode} onStartEditConnections={handleStartEditConnections} />;
      case 'dashboard': return <DashboardPage edge={selectedEdge} nodes={nodes} monitoringData={monitoringData} />;
      default: return <MainPage nodes={nodes} edges={edges} onNodeClick={handleNodeClick} onEdgeClick={handleEdgeClick} monitoringData={monitoringData} editingNodeId={editingNodeId} onToggleEdge={handleToggleEdge} onFinishEditing={handleFinishEditing} hoveredEdgeInfo={hoveredEdgeInfo} onEdgeHover={handleEdgeHover} onEdgeLeave={handleEdgeLeave} onUpdateNodePosition={handleUpdateNodePosition} />;
    }
  };

  return (<div className="App"><StyleProvider /><Navbar onNavigate={handleNavigate} />{renderPage()}<Footer /></div>);
}
