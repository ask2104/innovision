import React, { useState } from 'react';

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

export default NodeInfoPage;
