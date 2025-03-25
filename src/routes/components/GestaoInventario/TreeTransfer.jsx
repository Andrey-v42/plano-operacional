import React, { useState } from 'react';
import { Transfer } from 'antd';

/**
 * Componente de TreeTransfer customizado
 * Permite a transferência de itens entre duas listas
 * 
 * @param {Array} dataSource - Array de objetos para exibir no componente
 * @param {Array} targetKeys - Array de chaves dos itens já selecionados (lado direito)
 * @param {Function} onChange - Função chamada quando os itens selecionados mudam
 * @param {Array} titles - Títulos para as duas listas [esquerda, direita]
 */
const TreeTransfer = ({ dataSource, targetKeys, onChange, titles }) => {
  const [localTargetKeys, setLocalTargetKeys] = useState(targetKeys);

  const handleChange = (newTargetKeys) => {
    setLocalTargetKeys(newTargetKeys);
    if (onChange) {
      onChange(newTargetKeys);
    }
  };

  return (
    <Transfer
      targetKeys={localTargetKeys}
      dataSource={dataSource}
      render={(item) => item.title}
      onChange={handleChange}
      titles={titles}
      listStyle={{
        width: '45%',
        height: 400,
      }}
    />
  );
};

export default TreeTransfer;