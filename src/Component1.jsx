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
import { v7 as uuidv7 } from 'uuid';

const nodeTypes = { textUpdater: TextUpdaterNode };
const nodeOrigin = [0.5, 0.5]; // Точка привязки узла (центр)

// Счетчик для кнопки "Добавить узел (общий)"
let generalNodeIdCounter = 1;
const getGeneralNodeId = () => `general-${generalNodeIdCounter++}`;

const FlowWithAddButton = () => {
  const reactFlowWrapper = useRef(null);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  // Функция для добавления узла, вызываемая из кастомного узла
  const addNodeFromCustom = useCallback((parentNodeProps) => {
    const {
      id: parentId,
      type: parentNodeSpecificType, // Тип родительского узла
      xPos: parentX,
      yPos: parentY,
      width: parentWidth, // Может быть null, если узел еще не отрендерен
      height: parentHeight, // Может быть null
    } = parentNodeProps;

    const newNodeId = uuidv7();
    // Позиционируем новый узел ниже родительского
    const newYPosition = parentY + (parentHeight || 60) + 100; // Используем высоту родителя или значение по умолчанию + отступ
    const newXPosition = parentX; // По той же X координате или со смещением, например parentX + (parentWidth || 150) / 2 - 75 (для центрирования)

    const newNode = {
      id: newNodeId,
      type: parentNodeSpecificType, // Новый узел будет того же типа, что и родительский
      position: { x: newXPosition, y: newYPosition },
      origin: nodeOrigin,
      draggable: true,
      data: {
        label: `Узел ${newNodeId} (от ${parentId})`,
        // Каждый новый узел также получает способность добавлять другие узлы
        actionCallback: (propsFromThisNewNode) => addNodeFromCustom(propsFromThisNewNode),
      },
    };

    setNodes((nds) => nds.concat(newNode));
    console.log(`Добавлен новый узел ${newNodeId} от родителя ${parentId}`);
  }, [setNodes, nodeOrigin]); // Зависимости для useCallback

  // Эффект для обновления узлов, если getInitialNodes меняется (например, если addNodeFromCustom пересоздается)
  // Это может быть излишним, если addNodeFromCustom стабилен, но для безопасности:
  useEffect(() => {
    setNodes(getInitialNodes());
  }, [addNodeFromCustom, setNodes]);
  
  // Функция для инициализации начальных узлов
  // Мы используем функцию, чтобы callback `addNodeFromCustom` был правильно замкнут
  const getInitialNodes = useCallback(() => [
    {
      id: '0',
      type: 'textUpdater',
      data: {
        label: 'Начальный узел (ID: 0)',
        // Эта actionCallback будет вызвана из TextUpdaterNode
        // Она ожидает, что TextUpdaterNode передаст ей свои пропсы
        actionCallback: (propsOfNode0) => addNodeFromCustom(propsOfNode0),
      },
      position: { x: 250, y: 50 }, // Начальная позиция
    },
  ], [addNodeFromCustom]); // Зависит от addNodeFromCustom

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onConnectEnd = useCallback((event) => {
    // Логика при завершении соединения на пустом поле (если нужна)
    console.log('Попытка соединения завершена:', event);
  }, []);

  // Функция для кнопки "Добавить узел (общий)"
  const addGenericNode = useCallback(() => {
    const newNodeId = getGeneralNodeId();
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
      position,
      data: { label: `Общий узел ${newNodeId}` }, // У этих узлов нет actionCallback по умолчанию
      origin: nodeOrigin,
      type: 'default', // или 'textUpdater', если хотите такой же тип
      // Если хотите, чтобы и эти узлы могли добавлять дочерние:
      // type: 'textUpdater',
      // data: {
      //   label: `Общий узел ${newNodeId}`,
      //   actionCallback: (props) => addNodeFromCustom(props),
      // },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [screenToFlowPosition, setNodes, nodes, nodeOrigin, addNodeFromCustom]); // Добавили addNodeFromCustom, если используем его для общих узлов


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
        nodeOrigin={nodeOrigin}
        style={{ backgroundColor: '#F7F9FB' }}
        nodeTypes={nodeTypes}
      >
        <Background />
        {/* <Controls /> */}
      </ReactFlow>

      <button
        onClick={addGenericNode}
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
        title="Добавить новый общий узел"
      >
        Добавить узел (общий)
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