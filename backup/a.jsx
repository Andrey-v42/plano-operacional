const multiplasDevolucoes = async () => {
    try {
      setDrawerMultipleLoading(true)
      for (const pdv of selectedRows) {
        const completeData = {
          ...formMultipleOp,
          TecnicoResponsavel: localStorage.getItem('currentUser'),
          assinatura: signature,
          dataHora: new Date().toLocaleString(),
          // Include both structures for compatibility
          modelo_terminal: pdv.modelo || 'N/A',
          qtd_terminal: parseInt(pdv.totalTerminais) || 0,
          qtd_suporte: parseInt(pdv.capas) || 0,
          qtd_carreg: parseInt(pdv.carregadores) || 0,
          qtd_cartao: parseInt(pdv.cartoes) || 0,
          qtd_powerbank: parseInt(pdv.powerbanks) || 0,
          qtd_tomada: parseInt(pdv.tomadas) || 0,
          // Include the full equipment list for the new structure
          equipamentos: pdv.equipamentos || [],
          timestamp: new Date().getTime()
        }
  
        const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDoc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            formData: completeData,
            docId: pdv.key,
            collectionURL: `pipe/pipeId_${pipeId}/protocolosDevolucao`
          })
        })
  
        if (response.ok) {
          const responsePlano = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/editDocAlternative', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ docId: `pipeId_${pipeId}/planoOperacional/${pdv.key}`, data: { devolvido: true } })
          })
        } else {
          console.error('Error on sending data to server:', response.status);
        }
      }
  
      // Refresh data
      const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/planoOperacional` }),
      });
  
      const responseEntrega = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosEntrega` }),
      });
  
      const responseDevolucao = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getQuerySnapshotNoOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: `pipe/pipeId_${pipeId}/protocolosDevolucao` }),
      });
  
      let docs = await response.json();
      docs = docs.docs;
  
      let docsEntrega = await responseEntrega.json()
      docsEntrega = docsEntrega.docs;
  
      let docsDevolucao = await responseDevolucao.json()
      docsDevolucao = docsDevolucao.docs;
  
      const entregaMap = Object.fromEntries(docsEntrega.map(doc => [doc.id, doc.data]));
      const devolucaoMap = Object.fromEntries(docsDevolucao.map(doc => [doc.id, doc.data]));
  
      // Process with new equipment structure
      const formattedData = docs.filter(doc => doc.data.CATEGORIA !== 'CART - CARTÕES').map((doc) => {
        const data = doc.data;
        const entregaData = entregaMap[doc.id] || {};
        const devolucaoData = devolucaoMap[doc.id] || {};
        
        // Process equipments from new array structure
        const equipments = data.EQUIPAMENTOS || [];
        
        // Initialize counters for each equipment type
        let totalTerminais = 0;
        let carregadores = 0;
        let capas = 0;
        let cartoes = 0;
        let powerbanks = 0;
        let tomadas = 0;
        let modelo = '';
        
        // Process equipment data
        equipments.forEach(equip => {
          // Set primary terminal model if available
          if (equip.TIPO === 'TERMINAL' && !modelo) {
            modelo = equip.MODELO;
          }
          
          // Accumulate quantities based on equipment type
          switch(equip.TIPO) {
            case 'TERMINAL':
              totalTerminais += parseInt(equip.QUANTIDADE) || 0;
              break;
            case 'CARREGADOR':
              carregadores += parseInt(equip.QUANTIDADE) || 0;
              break;
            case 'CAPA':
            case 'SUPORTE':
              capas += parseInt(equip.QUANTIDADE) || 0;
              break;
            case 'CARTAO':
            case 'CARTÃO CASHLESS':
              cartoes += parseInt(equip.QUANTIDADE) || 0;
              break;
            case 'POWERBANK':
              powerbanks += parseInt(equip.QUANTIDADE) || 0;
              break;
            case 'TOMADA':
            case 'PONTO DE TOMADA':
              tomadas += parseInt(equip.QUANTIDADE) || 0;
              break;
            default:
              break;
          }
        });
        
        // Fallback to the old structure if EQUIPAMENTOS is not present
        if (equipments.length === 0) {
          modelo = data.MODELO || '';
          totalTerminais = data['TOTAL TERM'] ? data['TOTAL TERM'] == ' ' ? 0 : parseInt(data['TOTAL TERM']) : 0;
          cartoes = data['CARTÃO CASHLES'] ? data['CARTÃO CASHLES'] == ' ' ? 0 : parseInt(data['CARTÃO CASHLES']) : 0;
          powerbanks = data['POWER BANK'] ? data['POWER BANK'] == ' ' ? 0 : parseInt(data['POWER BANK']) : 0;
          carregadores = data.CARREG ? data.CARREG == ' ' ? 0 : parseInt(data.CARREG) : 0;
          capas = data['CAPA SUPORTE'] ? data['CAPA SUPORTE'] == ' ' ? 0 : parseInt(data['CAPA SUPORTE']) : 0;
          tomadas = data['PONTOS TOMADA'] ? data['PONTOS TOMADA'] == ' ' ? 0 : parseInt(data['PONTOS TOMADA']) : 0;
        }
        
        return {
          key: doc.id,
          ID: data.rowNumber,
          Setor: data.SETOR || 'N/A',
          'Ponto de Venda': data['NOME PDV'],
          Categoria: data.CATEGORIA || 'N/A',
        Status: data.aberto && !data.devolvido ? 'Entregue'
          : data.aberto && data.devolvido ? 'Devolvido'
          : 'Entrega Pendente',
        'Perda/Avaria': devolucaoData?.Avarias?.length > 0 ? 'Sim' : 'Não',
        modelo: modelo,
        cartoes: cartoes,
        totalTerminais: totalTerminais,
        powerbanks: powerbanks,
        carregadores: carregadores,
        capas: capas,
        tomadas: tomadas,
        desativado: data.desativado == true ? true : false,
        modifications: data.modifications ? data.modifications : null,
        statusModification: data.statusModification ? data.statusModification : null,
        entregaInfo: entregaData,
        devolucaoInfo: devolucaoData,
        equipamentos: equipments
      };
    });

    setSelectedRowKeys([])
    setSelectedRows([])
    setFirstStatus(null)
    setDataPlano(formattedData)
    openNotificationSucessPDV('devolvido')
    setDrawerMultipleLoading(false)
    setDrawerMultipleVisible(false)
    setSelectedRowKeys([])
    setSelectedRows([])
    formMultiple.resetFields()
    setFormMultipleOp({})
    setSignature('')
  } catch (error) {
    console.error(error)
    setDrawerMultipleLoading(false)
    openNotificationFailure('Erro ao realizar múltiplas devoluções: ' + error.message)
  }
}