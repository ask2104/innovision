// src/App.js
import React, { useState, useEffect } from 'react'; // Removed useCallback
import { onValue, ref } from 'firebase/database'; // Removed set and remove from this import
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

import MainPage from './pages/Mainpage.js';
import DashboardPage from './pages/Dashboard.js';
import NodeInfoPage from './pages/NodeInfoPage.js';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import { db, auth } from './firebase.js'; 
import { handleMonitoringUpdate, handleDeleteNode, handleToggleEdge, handleUpdateNodePosition } from './utils/firebaseHandlers.js';

// CSS styles originally in App.js are moved to index.css
const StyleProvider = () => {
    return null;
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
    const unsubscribeMonitoring = onValue(monitoringRef, (snapshot) => { 
      handleMonitoringUpdate(snapshot.val(), setNodes, setMonitoringData);
    });

    return () => {
        unsubscribeNodes();
        unsubscribeEdges();
        unsubscribeMonitoring();
    };
  }, [isAuthReady]);

  const onNavigate = (targetPage) => { setEditingNodeId(null); setPage(targetPage); };
  
  const onNodeClick = (node) => { setSelectedNode(node); setPage('nodeInfo'); };
  const onEdgeClick = (edge) => { setSelectedEdge(edge); setPage('dashboard'); };
  
  const onDeleteNode = (nodeIdToDelete) => {
    handleDeleteNode(db, nodes, edges, nodeIdToDelete);
    if (editingNodeId === nodeIdToDelete) setEditingNodeId(null);
    setPage('main');
  };
  
  const onStartEditConnections = (nodeId) => { setEditingNodeId(nodeId); onNavigate('main'); };
  const onFinishEditing = () => setEditingNodeId(null);
  
  const onToggleEdge = (targetNodeId) => {
    handleToggleEdge(db, edges, editingNodeId, targetNodeId);
  };
  
  const onEdgeHover = (e, edge, status) => setHoveredEdgeInfo({ x: e.clientX + 15, y: e.clientY + 15, from: edge.from, to: edge.to, status });
  const onEdgeLeave = () => setHoveredEdgeInfo(null);
  
  const onUpdateNodePosition = (nodeId, lat, lng) => {
    handleUpdateNodePosition(db, nodes, nodeId, lat, lng);
  };

  const renderPage = () => {
    const currentNode = nodes.find(n => n.id === selectedNode?.id) || selectedNode;
    switch (page) {
      case 'nodeInfo':
        return <NodeInfoPage
          node={currentNode}
          onDeleteNode={onDeleteNode}
          onStartEditConnections={onStartEditConnections}
        />;
      case 'dashboard':
        return <DashboardPage
          edge={selectedEdge}
          nodes={nodes}
          monitoringData={monitoringData}
        />;
      default:
        return <MainPage
          nodes={nodes}
          edges={edges}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          monitoringData={monitoringData}
          editingNodeId={editingNodeId}
          onToggleEdge={onToggleEdge}
          onFinishEditing={onFinishEditing}
          hoveredEdgeInfo={hoveredEdgeInfo}
          onEdgeHover={onEdgeHover}
          onEdgeLeave={onEdgeLeave}
          onUpdateNodePosition={onUpdateNodePosition}
        />;
    }
  };

  return (
    <div className="App">
      <StyleProvider />
      <Navbar onNavigate={onNavigate} />
      {renderPage()}
      <Footer />
    </div>
  );
}