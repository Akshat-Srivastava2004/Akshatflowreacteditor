// App.jsx
import React, { useCallback } from 'react';
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

// Node colors
const nodeColor = (node) => {
  switch (node.type) {
    case 'input':
      return '#6ede87';
    case 'output':
      return '#6865A5';
    default:
      return '#ff0072';
  }
};

// Custom Node Component
const CustomNode = ({ data }) => {
  const [message, setMessage] = React.useState(data.message || '');

  return (
    <div
      style={{
        backgroundColor: nodeColor({ type: data.type }),
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

// Node types mapping
const nodeTypes = {
  custom: CustomNode,
};

// Sidebar
const Sidebar = ({ addNode ,deleteNode}) => {
  return (
    <div className="sidebar">
      <button onClick={() => addNode('input')}>Add Input Node</button>
      <button onClick={() => addNode('default')}>Add Default Node</button>
      <button onClick={() => addNode('output')}>Add Output Node</button>
      <button onClick={deleteNode}>Delete Selected Node</button>
    </div>
  );
};

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = React.useState(null);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: '#0041d0', strokeWidth: 2 } }, eds)
      ),
    [setEdges]
  );
 // Delete selected node
  const deleteNode = () => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
    setSelectedNodeId(null);
  };
  // Add node dynamically
  const addNode = (type) => {
    const id = (nodes.length + 1).toString();
    const label = type === 'input' ? 'Input Node' : type === 'output' ? 'Output Node' : `Node ${id}`;
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
        nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, label } } : n))
      );
    }
  };
 // Track selected node
  const onSelectionChange = useCallback(({ nodes }) => {
    setSelectedNodeId(nodes.length ? nodes[0].id : null);
  }, []);

  return (
    <div className="wrapper">
      <Sidebar addNode={addNode} deleteNode={deleteNode} />
      <div className="flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
            onSelectionChange={onSelectionChange}
          fitView
          nodeTypes={nodeTypes}
           onNodeDoubleClick={onNodeDoubleClick}
          style={{ width: '100%', height: '100%' }}
        >
          <MiniMap nodeColor={nodeColor} nodeStrokeWidth={3} zoomable pannable />
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
