import React, { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import './TextUpdaterNode.css'; // Убедитесь, что этот файл CSS существует или удалите импорт

// Пропсы, которые React Flow передает кастомным узлам:
// id, data, type, xPos, yPos, zIndex, selected, dragging, targetPosition, sourcePosition, width, height, isConnectable
function TextUpdaterNode({ id, data, type, xPos, yPos, width, height, isConnectable }) {
  const onChange = useCallback((evt) => {
    console.log(`Input changed in node ${id}:`, evt.target.value);
    // Здесь вы можете добавить логику для обновления данных узла, если это необходимо
    // Например, вызывая функцию, переданную через data, для обновления состояния в FlowWithAddButton
  }, [id]);

  const handleAddNodeClick = useCallback(() => {
    if (data && typeof data.actionCallback === 'function') {
      // Передаем пропсы текущего узла в callback-функцию
      data.actionCallback({ id, type, xPos, yPos, width, height, data });
    } else {
      console.warn('actionCallback не определена или не является функцией в данных узла:', data);
    }
  }, [id, type, data, xPos, yPos, width, height]); // Зависимости для useCallback

  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div>
        {/* Отображаем метку узла, если она есть в data */}
        {data && data.label && <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{data.label}</p>}

        {/* Используйте уникальные id для инпутов, если у вас несколько таких узлов */}
        <label htmlFor={`level1-${id}`}>level1:</label>
        <input id={`level1-${id}`} name="text1" onChange={onChange} className="nodrag" style={{ marginBottom: '5px' }} />

        <label htmlFor={`level2-${id}`}>level2:</label>
        <input id={`level2-${id}`} name="text2" onChange={onChange} className="nodrag" style={{ marginBottom: '5px' }} />

        <label htmlFor={`level3-${id}`}>level3:</label>
        <input id={`level3-${id}`} name="text3" onChange={onChange} className="nodrag" style={{ marginBottom: '10px' }} />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="a" // Можно задать ID для handle, если их несколько
        isConnectable={isConnectable}
      />
      {/* Кнопка вызывает handleAddNodeClick, который, в свою очередь, вызывает data.actionCallback */}
      <button onClick={handleAddNodeClick} style={{ marginTop: '5px' }}>Add Child Node</button>
    </div>
  );
}

export { TextUpdaterNode };