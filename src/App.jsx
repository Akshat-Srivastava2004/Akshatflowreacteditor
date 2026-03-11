import * as htmlToImage from 'html-to-image';
import { getNodesBounds, getViewportForBounds } from "@xyflow/react";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './index.css';

const nodeColor = (node) => {
  if (node.data?.customColor) {
    return node.data.customColor;
  }
  switch (node.type) {
    case 'input':
      return '#6ede87';
    case 'output':
      return '#6865A5';
    default:
      return '#ff0072';
  }
};

const CustomNode = ({ data }) => {
  const [message, setMessage] = React.useState(data.message || '');

  return (
    <div
      style={{
        backgroundColor: nodeColor({ type: data.type, data }),
        color: 'white',
        padding: 10,
        minWidth: 150,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 5,
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 5 }}>{data.label}</div>
      <textarea
        style={{
          width: '100%',
          resize: 'none',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: 5,
          color: 'white',
          fontSize: 14,
        }}
        value={message}
        placeholder="Type here..."
        onChange={(e) => setMessage(e.target.value)}
        rows={1}
        onInput={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = e.target.scrollHeight + 'px';
        }}
      />
      <Handle type="target" position="top" style={{ background: '#555' }} />
      <Handle type="source" position="bottom" style={{ background: '#555' }} />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const generateProjectId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Use this API endpoint - replace with your backend URL
const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api' 
  : 'https://your-backend.com/api';

const Sidebar = ({
  addNode,
  deleteNode,
  changeNodeColor,
  edges,
  updateEdgeLabel,
  selectedEdge,
  setSelectedEdge,
  projectId,
  onDownload,
  nodes,
  onProjectIdChange,
}) => {
  const [textInput, setTextInput] = React.useState(selectedEdge?.data?.label || '');
  const [copied, setCopied] = React.useState(false);
  const [manualProjectId, setManualProjectId] = React.useState(projectId || '');

  useEffect(() => {
    if (selectedEdge?.data?.label) {
      setTextInput(selectedEdge.data.label);
    }
  }, [selectedEdge]);

  const handleAddText = () => {
    if (selectedEdge) {
      updateEdgeLabel(selectedEdge.id, textInput);
    }
  };

  const handleClearText = () => {
    setTextInput('');
    if (selectedEdge) {
      updateEdgeLabel(selectedEdge.id, '');
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}?projectId=${projectId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSetProjectId = () => {
    if (manualProjectId.trim()) {
      onProjectIdChange(manualProjectId.trim());
    }
  };

  const colors = [
    { name: 'Green', color: '#6ede87' },
    { name: 'Purple', color: '#6865A5' },
    { name: 'Pink', color: '#ff0072' },
    { name: 'Blue', color: '#0041d0' },
    { name: 'Red', color: '#ff4757' },
    { name: 'Orange', color: '#ffa502' },
    { name: 'Cyan', color: '#00d4ff' },
    { name: 'Yellow', color: '#ffd60a' },
  ];

  return (
    <div className="sidebar">
      <h3 style={{ marginTop: 0 }}>Project: {projectId}</h3>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
          Enter Project ID:
        </label>
        <input
          type="text"
          value={manualProjectId}
          onChange={(e) => setManualProjectId(e.target.value)}
          placeholder="Enter project ID..."
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginBottom: '5px',
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={handleSetProjectId}
          style={{
            width: '100%',
            padding: '8px',
            background: '#0041d0',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Set Project ID
        </button>
      </div>

      <button
        onClick={handleCopyLink}
        style={{
          width: '100%',
          padding: '10px',
          background: '#0041d0',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '8px',
        }}
      >
        {copied ? '✓ Link Copied!' : 'Copy Share Link'}
      </button>

      <button
        onClick={onDownload}
        style={{
          width: '100%',
          padding: '10px',
          background: '#6ede87',
          color: 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '15px',
          fontWeight: 'bold',
        }}
      >
        ⬇ Download as Image
      </button>

      <hr style={{ margin: '15px 0' }} />

      <h3>Add Nodes</h3>
      <button onClick={() => addNode('input')}>Add Input Node</button>
      <button onClick={() => addNode('default')}>Add Default Node</button>
      <button onClick={() => addNode('output')}>Add Output Node</button>
      <button onClick={deleteNode}>Delete Selected Node</button>

      <hr style={{ margin: '20px 0' }} />
      <h3>Add Text Between Nodes</h3>
      <textarea
        style={{
          width: '100%',
          height: '150px',
          padding: '8px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          fontFamily: 'Arial, sans-serif',
          fontSize: '14px',
          boxSizing: 'border-box',
        }}
        placeholder="Enter text for edge..."
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
      />
      <button onClick={handleAddText} style={{ marginTop: '8px', width: '100%' }}>
        {selectedEdge ? 'Update Edge Text' : 'Add Text to Edge'}
      </button>
      <button
        onClick={handleClearText}
        style={{ marginTop: '5px', width: '100%', background: '#ff6b6b' }}
      >
        Clear Text
      </button>

      <hr style={{ margin: '20px 0' }} />
      <h3>Node Colors</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {colors.map((c) => (
          <button
            key={c.color}
            onClick={() => changeNodeColor(c.color)}
            style={{
              background: c.color,
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
};

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = React.useState(null);
  const [selectedEdge, setSelectedEdge] = React.useState(null);
  const [projectId, setProjectId] = React.useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('Ready');
  const reactFlowWrapper = useRef(null);
  const syncTimerRef = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const lastSyncRef = useRef({});

  // Load project on mount
  useEffect(() => {
    const loadProject = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlProjectId = params.get('projectId');

      if (urlProjectId) {
        setProjectId(urlProjectId);
        try {
          // Try to fetch from backend
          setSyncStatus('Loading from cloud...');
          const response = await fetch(`${API_BASE}/projects/${urlProjectId}`);
          if (response.ok) {
            const data = await response.json();
            setNodes(data.nodes || []);
            setEdges(data.edges || []);
            lastSyncRef.current = { nodes: data.nodes, edges: data.edges };
            setSyncStatus('Synced');
          } else {
            // Fallback to localStorage
            const savedProject = localStorage.getItem(`project_${urlProjectId}`);
            if (savedProject) {
              const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedProject);
              setNodes(savedNodes);
              setEdges(savedEdges);
              lastSyncRef.current = { nodes: savedNodes, edges: savedEdges };
              setSyncStatus('Local cache');
            }
          }
        } catch (error) {
          console.log('[v0] Backend not available, using localStorage');
          setSyncStatus('Offline mode');
          const savedProject = localStorage.getItem(`project_${urlProjectId}`);
          if (savedProject) {
            const { nodes: savedNodes, edges: savedEdges } = JSON.parse(savedProject);
            setNodes(savedNodes);
            setEdges(savedEdges);
            lastSyncRef.current = { nodes: savedNodes, edges: savedEdges };
          }
        }
      } else {
        const newProjectId = generateProjectId();
        setProjectId(newProjectId);
        window.history.replaceState({}, '', `?projectId=${newProjectId}`);
        setSyncStatus('New project');
      }
      setIsLoading(false);
    };

    loadProject();
  }, []);

  // Auto-save to cloud and poll for updates
  useEffect(() => {
    if (!projectId || isLoading) return;

    const syncProject = async () => {
      try {
        // Save to backend
        await fetch(`${API_BASE}/projects/${projectId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nodes, edges }),
        }).catch(() => {
          // Backend unavailable, just use localStorage
          localStorage.setItem(`project_${projectId}`, JSON.stringify({ nodes, edges }));
        });

        // Fetch latest from backend to see if others made changes
        try {
          const response = await fetch(`${API_BASE}/projects/${projectId}`);
          if (response.ok) {
            const data = await response.json();
            const lastSync = lastSyncRef.current;
            
            // Check if remote data is different from our local data
            const localChanged = JSON.stringify({ nodes, edges }) !== JSON.stringify(lastSync);
            const remoteChanged = JSON.stringify(data) !== JSON.stringify(lastSync);
            
            // If remote changed and we didn't make changes, update local
            if (remoteChanged && !localChanged) {
              console.log('[v0] Pulling updates from cloud');
              setNodes(data.nodes || []);
              setEdges(data.edges || []);
            }
            lastSyncRef.current = { nodes: data.nodes, edges: data.edges };
            setSyncStatus('Synced');
          }
        } catch (e) {
          // Just use localStorage
          localStorage.setItem(`project_${projectId}`, JSON.stringify({ nodes, edges }));
        }
      } catch (error) {
        console.log('[v0] Sync error:', error);
        localStorage.setItem(`project_${projectId}`, JSON.stringify({ nodes, edges }));
      }
    };

    // Save immediately and then every 2 seconds
    syncProject();
    syncTimerRef.current = setInterval(syncProject, 2000);

    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    };
  }, [nodes, edges, projectId, isLoading]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#0041d0', strokeWidth: 2 },
            data: { label: '' },
          },
          eds
        )
      ),
    [setEdges]
  );

  const deleteNode = () => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId)
    );
    setSelectedNodeId(null);
  };

  const changeNodeColor = (color) => {
    if (!selectedNodeId) return;
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNodeId
          ? { ...node, data: { ...node.data, customColor: color } }
          : node
      )
    );
  };

  const addNode = (type) => {
    const id = (nodes.length + 1).toString();
    const label =
      type === 'input' ? 'Input Node' : type === 'output' ? 'Output Node' : `Node ${id}`;
    const newNode = {
      id,
      type: 'custom',
      data: { label, message: '', type },
      position: { x: 150 + Math.random() * 300, y: 100 + Math.random() * 300 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onNodeDoubleClick = (event, node) => {
    const label = prompt('Enter new label:', node.data.label);
    if (label) {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, data: { ...n.data, label } } : n
        )
      );
    }
  };

  const onEdgeClick = (event, edge) => {
    setSelectedEdge(edge);
  };

  const updateEdgeLabel = (edgeId, label) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id === edgeId ? { ...e, label, data: { ...e.data, label } } : e
      )
    );
  };

  const onSelectionChange = useCallback(({ nodes }) => {
    setSelectedNodeId(nodes.length ? nodes[0].id : null);
  }, []);

const handleDownload = () => {
  if (!reactFlowInstance) return;

  const nodesBounds = getNodesBounds(nodes);

  const viewport = getViewportForBounds(
    nodesBounds,
    1920,
    1080,
    0.5,
    2
  );

  const transform = `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`;

  const flow = document.querySelector(".react-flow__viewport");

  htmlToImage
    .toPng(flow, {
      backgroundColor: "white",
      width: 1920,
      height: 1080,
      style: {
        transform: transform,
        transformOrigin: "top left",
      },
    })
    .then((dataUrl) => {
      const link = document.createElement("a");
      link.download = `workflow_${projectId}.png`;
      link.href = dataUrl;
      link.click();
    });
};

  const handleProjectIdChange = (newId) => {
    setProjectId(newId);
    window.history.replaceState({}, '', `?projectId=${newId}`);
    localStorage.setItem(`project_${newId}`, JSON.stringify({ nodes, edges }));
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading project...</h2>
      </div>
    );
  }

  return (
    <div className="wrapper">
      <Sidebar
        addNode={addNode}
        deleteNode={deleteNode}
        changeNodeColor={changeNodeColor}
        edges={edges}
        updateEdgeLabel={updateEdgeLabel}
        selectedEdge={selectedEdge}
        setSelectedEdge={setSelectedEdge}
        projectId={projectId}
        onDownload={handleDownload}
        nodes={nodes}
        onProjectIdChange={handleProjectIdChange}
      />
    <div className="flow-container" ref={reactFlowWrapper}>
        <div style={{ position: 'absolute', top: 10, right: 10, backgroundColor: '#f0f0f0', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', zIndex: 10 }}>
          {syncStatus}
        </div>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onInit={setReactFlowInstance}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          fitView
          nodeTypes={nodeTypes}
          onNodeDoubleClick={onNodeDoubleClick}
          onEdgeClick={onEdgeClick}
          style={{ width: '100%', height: '100%' }}
        >
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
