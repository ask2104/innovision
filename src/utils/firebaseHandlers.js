import { ref, set, remove } from 'firebase/database';
import { db } from '../firebase.js'; // Corrected import path to db

// Handles updates from the 3PhaseMonitoring path
export const handleMonitoringUpdate = (rawData, setNodes, setMonitoringData) => {
  if (rawData) {
    const normalizedData = {};
    const poleTwids = Object.keys(rawData).map(key => key.replace('.json', ''));
    
    poleTwids.forEach(twid => {
      const key = `${twid}.json`;
      normalizedData[twid] = rawData[key] || rawData[twid];
    });
    setMonitoringData(normalizedData);

    // Auto-add new nodes if they are detected
    setNodes(currentNodes => {
      const existingTwids = currentNodes.map(n => n.twid);
      const newTwids = poleTwids.filter(twid => !existingTwids.includes(twid));

      if (newTwids.length > 0) {
        let lastNode = currentNodes.length > 0 ? [...currentNodes].sort((a,b) => a.id.localeCompare(b.id)).pop() : null;
        const defaultLat = 19.2187;
        const defaultLng = 73.1256;

        newTwids.forEach((newTwid, index) => {
          const nextIdNumber = (lastNode ? parseInt(lastNode.id.replace('TW', '')) : 0) + index + 1;
          const newNode = {
            id: `TW${String(nextIdNumber).padStart(2, '0')}`,
            twid: newTwid,
            // Generate mock lat/lng based on the default map center
            lat: defaultLat + (Math.random() - 0.5) * 0.05,
            lng: defaultLng + (Math.random() - 0.5) * 0.05,
            location: `${newTwid}`,
            installDate: new Date().toISOString().split('T')[0],
            lastJob: 'Auto-registered'
          };
          set(ref(db, `nodes/${newNode.id}`), newNode);

          if (lastNode) {
            const newEdge = { from: lastNode.id, to: newNode.id };
            const edgeId = [newEdge.from, newEdge.to].sort().join('-');
            set(ref(db, `edges/${edgeId}`), newEdge);
          }
          lastNode = newNode;
        });
      }
      return currentNodes;
    });
  } else {
    setMonitoringData({});
  }
};

// Deletes a node and its associated edges from Firebase
export const handleDeleteNode = (db, nodes, edges, nodeIdToDelete) => {
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
};

// Adds or removes an edge between two nodes
export const handleToggleEdge = (db, edges, editingNodeId, targetNodeId) => {
    if (!editingNodeId || editingNodeId === targetNodeId) return;
    const edgeId = [editingNodeId, targetNodeId].sort().join('-');
    const edgeExists = edges.some(e => [e.from, e.to].sort().join('-') === edgeId);
    if (edgeExists) {
        remove(ref(db, `edges/${edgeId}`));
    } else {
        set(ref(db, `edges/${edgeId}`), { from: editingNodeId, to: targetNodeId });
    }
};

// Updates the position of a draggable node in Firebase
export const handleUpdateNodePosition = (db, nodes, nodeId, lat, lng) => {
    const nodeRef = ref(db, `nodes/${nodeId}`);
    const currentNode = nodes.find(n => n.id === nodeId);
    if (currentNode) {
        set(nodeRef, { ...currentNode, lat, lng });
    }
};