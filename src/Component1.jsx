import React, { useCallback, useRef, useEffect } from 'react';
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  // Controls, // Раскомментируйте для элементов управления
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TextUpdaterNode } from './TextUpdaterNode'; // Убедитесь, что путь правильный

const nodeTypes = { textUpdater: TextUpdaterNode };
const nodeOrigin = [0.5, 0.5]; // Точка привязки узла (центр)

// Счетчик для ID новых узлов
let nodeIdCounter = 1;
const getNewNodeId = () => `node-${nodeIdCounter++}`;

// Начальные узлы
const initialNodes = [
  {
    id: '0',
    type: 'textUpdater', // Начальный узел также textUpdater
    data: { label: 'Начальный узел (ID: 0)' },
    position: { x: 250, y: 50 },
    // 'origin' будет использован из ReactFlow-пропа nodeOrigin
  },
];

const FlowWithAddButton = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();

  // useEffect для отслеживания изменений в узлах
  // useEffect(() => {
  //   console.log('Узлы изменились:', nodes);
  // }, [nodes]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onConnectEnd = useCallback((event) => {
    console.log('Попытка соединения завершена:', event);
  }, []);

  // Функция для кнопки "Добавить узел (общий)"
  const addNode = useCallback(() => {
    const newNodeId = getNewNodeId();
    let position = { x: 100, y: 100 }; // Позиция по умолчанию

    if (reactFlowWrapper.current) {
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const centerScreen = {
        x: reactFlowBounds.width / 2,
        y: reactFlowBounds.height / 2,
      };
      position = screenToFlowPosition(centerScreen);
    } else {
      // Фолбэк, если reactFlowWrapper еще не доступен
      const yOffset = nodes.length > 0 ? nodes[nodes.length - 1].position.y + 100 : 100;
      position = { x: 50, y: yOffset };
    }

    const newNode = {
      id: newNodeId,
      type: 'textUpdater', // Всегда тип 'textUpdater'
      position,
      // 'origin' будет использован из ReactFlow-пропа nodeOrigin
      data: { label: `TextUpdater Узел ${newNodeId}` }, // Данные для нового узла
    };
    setNodes((nds) => nds.concat(newNode));
    console.log(`Добавлен новый узел ${newNodeId} типа textUpdater`);
  }, [screenToFlowPosition, setNodes, nodes]); // Зависимости

  return (
    <div
      className="wrapper"
      ref={reactFlowWrapper}
      style={{ width: '100%', height: '100vh', position: 'relative' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodeOrigin={nodeOrigin} // Глобальная точка привязки для узлов
        style={{ backgroundColor: '#F7F9FB' }}
        nodeTypes={nodeTypes}
      >
        <Background />
        {/* <Controls /> */}
      </ReactFlow>

      <button
        onClick={addNode}
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          padding: '10px 15px',
          fontSize: '14px',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 10,
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        }}
        title="Добавить новый TextUpdater узел" // Обновленный title
      >
        Добавить узел (общий) {/* Текст кнопки сохранен */}
      </button>
    </div>
  );
};

// Обертка в ReactFlowProvider для использования хука useReactFlow
export default () => (
  <ReactFlowProvider>
    <FlowWithAddButton />
  </ReactFlowProvider>
);