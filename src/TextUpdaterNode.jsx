import React, { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import './TextUpdaterNode.css'; // Убедитесь, что этот файл CSS существует или удалите импорт

// Пропсы, которые React Flow передает кастомным узлам:
// id, data, zIndex, selected, dragging, targetPosition, sourcePosition, isConnectable
// type, xPos, yPos, width, height - удалены из деструктуризации, так как не используются
function TextUpdaterNode({ id, data, isConnectable }) {
  const onChange = useCallback((evt) => {
    console.log(`Input changed in node ${id}:`, evt.target.value);
    // Здесь вы можете добавить логику для обновления данных узла, если это необходимо
  }, [id]);

  // Кнопка "Add Child Node" и функция handleAddNodeClick удалены

  return (
    <div className="text-updater-node">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div>
        {/* Отображаем метку узла, если она есть в data */}
        {data && data.label && <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{data.label}</p>}

        <label htmlFor={`level1-${id}`}>level1:</label>
        <input id={`level1-${id}`} name="text1" onChange={onChange} className="nodrag" style={{ marginBottom: '5px' }} />

        {/* <label htmlFor={`level2-${id}`}>level2:</label>
        <input id={`level2-${id}`} name="text2" onChange={onChange} className="nodrag" style={{ marginBottom: '5px' }} />

        <label htmlFor={`level3-${id}`}>level3:</label>
        <input id={`level3-${id}`} name="text3" onChange={onChange} className="nodrag" style={{ marginBottom: '10px' }} /> */}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="a" // Можно задать ID для handle, если их несколько
        isConnectable={isConnectable}
      />
      {/* Кнопка для добавления дочернего узла удалена */}
    </div>
  );
}

export { TextUpdaterNode };