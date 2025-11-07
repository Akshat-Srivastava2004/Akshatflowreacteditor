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

const nodeColor = (node) => {
  // <CHANGE> Check for custom color first, then fall back to type-based color
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
        // <CHANGE> Use the updated nodeColor function that checks customColor
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

// <CHANGE> Enhanced Sidebar with Add Text feature and text editor
const Sidebar = ({ addNode, deleteNode, changeNodeColor, edges, updateEdgeLabel, selectedEdge, setSelectedEdge }) => {
  const [textInput, setTextInput] = React.useState(selectedEdge?.data?.label || '');
  const [nodeColor, setNodeColor] = React.useState('#ff0072');

  React.useEffect(() => {
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
      <h3 style={{ marginTop: 0 }}>Add Nodes</h3>
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
      <button onClick={handleClearText} style={{ marginTop: '5px', width: '100%', background: '#ff6b6b' }}>
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

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({
          ...params,
          animated: true,
          style: { stroke: '#0041d0', strokeWidth: 2 },
          data: { label: '' },
        }, eds)
      ),
    [setEdges]
  );

  const deleteNode = () => {
    if (!selectedNodeId) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
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

  // <CHANGE> Handle edge click to select and edit text
  const onEdgeClick = (event, edge) => {
    setSelectedEdge(edge);
  };

  // <CHANGE> Update edge label with text
  const updateEdgeLabel = (edgeId, label) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id === edgeId
          ? { ...e, label, data: { ...e.data, label } }
          : e
      )
    );
  };

  const onSelectionChange = useCallback(({ nodes }) => {
    setSelectedNodeId(nodes.length ? nodes[0].id : null);
  }, []);

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
/>
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