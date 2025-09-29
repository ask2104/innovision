// src/pages/MainPage.js
import React, { useState, useEffect } from 'react';
import { InteractiveMap, Marker, Source, Layer, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MainPage({
  nodes,
  edges,
  onNodeClick,
  onEdgeClick,
  monitoringData,
  editingNodeId,
  onToggleEdge,
  onFinishEditing,
  hoveredEdgeInfo,
  onEdgeHover,
  onEdgeLeave,
  onUpdateNodePosition,
}) {
  const [viewport, setViewport] = useState({
    latitude: 19.2187, // Default center
    longitude: 73.1256,
    zoom: 13
  });

  useEffect(() => {
    // Set map center to the first node's coordinates if available
    if (nodes.length > 0 && nodes[0].lat && nodes[0].lng) {
      setViewport(prev => ({
        ...prev,
        latitude: nodes[0].lat,
        longitude: nodes[0].lng,
      }));
    }
  }, [nodes]);

  const onDragEnd = (e, nodeId) => {
    onUpdateNodePosition(nodeId, e.lngLat[1], e.lngLat[0]);
  };

  const isNodeOnline = (node) => {
    const data = monitoringData[node.twid];
    if (!data || !data.lastSeen) return false;
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - data.lastSeen < fiveMinutes;
  };

  const getEdgeGeoJSON = () => {
    return {
      type: 'FeatureCollection',
      features: edges.map(edge => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);

        if (!fromNode || !toNode || !fromNode.lat || !fromNode.lng || !toNode.lat || !toNode.lng) {
          return null;
        }

        const edgeStatus = getEdgeStatus(edge);
        const color = getPolylineColor(edgeStatus);

        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [fromNode.lng, fromNode.lat],
              [toNode.lng, toNode.lat]
            ]
          },
          properties: {
            color: color,
            status: edgeStatus,
            from: edge.from,
            to: edge.to
          }
        };
      }).filter(Boolean)
    };
  };

  const getEdgeStatus = (edge) => {
    const fromNodeTwid = nodes.find(n => n.id === edge.from)?.twid;
    const toNodeTwid = nodes.find(n => n.id === edge.to)?.twid;
    const fromNodeStatus = monitoringData[fromNodeTwid]?.status;
    const toNodeStatus = monitoringData[toNodeTwid]?.status;
    if (fromNodeStatus === 'critical' || toNodeStatus === 'critical') return 'critical';
    if (fromNodeStatus === 'warning' || toNodeStatus === 'warning') return 'warning';
    return 'ok';
  };

  const getPolylineColor = (status) => {
    switch(status) {
      case 'critical': return 'var(--red-400)';
      case 'warning': return 'var(--yellow-400)';
      case 'ok': return 'var(--green-400)';
      default: return 'var(--slate-300)';
    }
  };

  const edgeLayerStyle = {
    id: 'edges',
    type: 'line',
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 4
    }
  };

  return (
    <div className="main-page-container">
      <h2 className="page-title">Tower Map View</h2>
      {editingNodeId && (
        <div className="editing-mode-info">
          <span>Editing connections for {editingNodeId}. Click a node to toggle connection.</span>
          <button onClick={onFinishEditing} className="finish-editing-button">Done Editing</button>
        </div>
      )}

      <InteractiveMap
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_API_KEY}
        {...viewport}
        width="100%"
        height="70vh"
        mapStyle="mapbox://styles/mapbox/standard"
        onViewportChange={setViewport}
      >
        <Source id="edges" type="geojson" data={getEdgeGeoJSON()}>
          <Layer {...edgeLayerStyle} />
        </Source>

        {nodes.map(node => (
          node.lat && node.lng && (
            <Marker
              key={node.id}
              longitude={node.lng}
              latitude={node.lat}
              anchor="bottom"
              draggable={editingNodeId === node.id}
              onDragEnd={(e) => onDragEnd(e, node.id)}
              onClick={() => (editingNodeId ? onToggleEdge(node.id) : onNodeClick(node))}
            >
              <div
                className={`network-node ${isNodeOnline(node) ? 'network-node-online' : 'network-node-offline'} ${editingNodeId === node.id ? 'network-node-editing' : ''}`}
                style={{ position: 'relative' }}
              >
                {node.id.replace('TW', '')}
                <div className="node-tooltip">
                  <strong>{node.id} ({isNodeOnline(node) ? 'Online' : 'Offline'})</strong>
                  <span>{node.location}</span>
                </div>
              </div>
            </Marker>
          )
        ))}
        {/* Note: Popup and hover logic needs to be refactored for react-map-gl v6.x. The current implementation won't work correctly. We can address this if you wish. */}
      </InteractiveMap>
    </div>
  );
}