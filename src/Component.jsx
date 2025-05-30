import React, { useCallback, useRef } from 'react';
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  // Controls, // Можно раскомментировать для добавления элементов управления
} from '@xyflow/react';

// Импортируем стили React Flow
import '@xyflow/react/dist/style.css';
import { TextUpdaterNode } from './TextUpdaterNode';
import { v7 as uuidv7 } from 'uuid';

const nodeTypes = {textUpdater: TextUpdaterNode};

const addNode2 = useCallback((type, originPosition) => {
  const newNodeId = uuidv7(); // Генерируем новый ID
  const position = { x: originPosition.x, y: originPosition.y + 100 }; // Значение по умолчанию

  const newNode = {
    id: newNodeId,
    position, // Используем рассчитанную позицию
    origin: nodeOrigin, // Используем общую точку привязки
    type: type, // Можно явно указать тип узла (по умолчанию 'default')
  };
  setNodes((nds) => nds.concat(newNode));
}, [setNodes, nodes]);

// Начальный узел
const initialNodes = [
  {
    id: '0',
    type: 'textUpdater', // Тип узла (встроенный)
    data: { actionCallback: () => addNode2('textUpdater', { x: 0, y: 50 })}, // Данные узла (отображаемая метка)
    position: { x: 0, y: 50 }, // Начальная позиция узла
    // actionCallback: () => addNode2('textUpdater', { x: 0, y: 50 }),
  },
];

// Счетчик для генерации уникальных ID
let id = 1;
const getId = () => `${id++}`;

// Точка привязки узла (0.5, 0.5) означает центр узла
const nodeOrigin = [0.5, 0.5];

// Основной компонент Flow
const FlowWithAddButton = () => {
  // Ref для обертки React Flow, используется для получения размеров
  const reactFlowWrapper = useRef(null);

  // Хуки для управления состоянием узлов и ребер
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Хук useReactFlow предоставляет доступ к внутренним методам React Flow
  const { screenToFlowPosition } = useReactFlow(); // project преобразует координаты экрана в координаты потока

  // Callback для обработки успешного соединения узлов (остается без изменений)
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges] // Зависимость: функция setEdges
  );

  // Callback, вызываемый при завершении попытки соединения (перетаскивания ребра)
  // Логика добавления узла отсюда УДАЛЕНА
  const onConnectEnd = useCallback((event, connectionState) => {
    // Теперь эта функция ничего не делает при отпускании ребра на пустом месте.
    // Можно добавить сюда другую логику при необходимости.
    console.log('Попытка соединения завершена на пустом поле:', connectionState);
  }, []); // Нет зависимостей

  // --- Новая функция для добавления узла ---
  const addNode = useCallback(() => {
    const newNodeId = getId(); // Генерируем новый ID

    // Рассчитываем позицию для нового узла.
    // Цель: разместить его в центре текущей видимой области React Flow.
    let position = { x: 100, y: 100 }; // Значение по умолчанию на случай, если ref еще не доступен

    if (reactFlowWrapper.current) {
      // Получаем границы контейнера React Flow
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      // Вычисляем координаты центра видимой области
      const centerScreen = {
        x: reactFlowBounds.width / 2,
        y: reactFlowBounds.height / 2,
      };
      // Преобразуем координаты центра экрана в координаты системы React Flow
      position = screenToFlowPosition(centerScreen);
    } else {
      // Альтернативная логика позиционирования, если ref недоступен
      // Например, немного ниже последнего узла или фиксированное смещение
      // (Эта логика может быть неточной, если узлы перемещались)
      console.warn("reactFlowWrapper ref не доступен, используется позиция по умолчанию.");
      position = { x: 0, y: 100 + nodes.length * 60 };
    }

    // position = { x: 0, y: 100 + nodes.length * 6 };

    // Создаем объект нового узла
    const newNode = {
      id: newNodeId,
      position, // Используем рассчитанную позицию
      data: { label: `Узел ${newNodeId}` }, // Метка нового узла
      origin: nodeOrigin, // Используем общую точку привязки
      // type: 'default', // Можно явно указать тип узла (по умолчанию 'default')
    };

    // Добавляем новый узел в состояние с помощью функции setNodes
    // Используем функциональную форму setNodes для гарантии работы с последним состоянием
    setNodes((nds) => nds.concat(newNode));

  }, [screenToFlowPosition, setNodes, nodes]); // Зависимости: project, setNodes, nodes (для альтернативной логики)

  return (
    // Обертка нужна для получения размеров через ref и для позиционирования кнопки
    <div
      className="wrapper"
      ref={reactFlowWrapper}
      style={{ width: '100%', height: '100vh', position: 'relative' }} // position: relative для позиционирования кнопки
    >
      <ReactFlow
        nodes={nodes} // Передаем узлы
        edges={edges} // Передаем ребра
        onNodesChange={onNodesChange} // Обработчик изменений узлов (перетаскивание, удаление)
        onEdgesChange={onEdgesChange} // Обработчик изменений ребер
        onConnect={onConnect} // Обработчик успешного соединения
        onConnectEnd={onConnectEnd} // Обработчик завершения попытки соединения
        fitView // Масштабировать и центрировать граф при загрузке
        fitViewOptions={{ padding: 0.2 }} // Небольшой отступ для fitView
        nodeOrigin={nodeOrigin} // Применяем точку привязки ко всем узлам
        style={{ backgroundColor: '#F7F9FB' }} // Стиль фона
        nodeTypes={nodeTypes}
      >
        {/* Компонент для отображения фона (точки или линии) */}
        <Background />
        {/* <Controls /> */} {/* Можно добавить элементы управления (зум, fitView) */}
      </ReactFlow>

      {/* Кнопка для добавления нового узла */}
      <button
        onClick={addNode} // Вызываем функцию addNode при клике
        style={{
          position: 'absolute', // Абсолютное позиционирование относительно div.wrapper
          bottom: '20px', // Отступ снизу
          left: '20px', // Отступ слева
          padding: '10px 15px', // Внутренние отступы
          fontSize: '14px', // Размер шрифта
          backgroundColor: 'white', // Цвет фона
          border: '1px solid #ccc', // Граница
          borderRadius: '4px', // Скругление углов
          cursor: 'pointer', // Курсор-указатель
          zIndex: 10, // Убедимся, что кнопка поверх холста React Flow
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)', // Тень для лучшей видимости
        }}
        title="Добавить новый узел" // Всплывающая подсказка
      >
        Добавить узел
      </button>
    </div>
  );
};

// Экспортируем компонент, обернутый в ReactFlowProvider
// ReactFlowProvider необходим для работы хука useReactFlow
export default () => (
  <ReactFlowProvider>
    <FlowWithAddButton />
  </ReactFlowProvider>
);
