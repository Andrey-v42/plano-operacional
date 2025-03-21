// localizacoes.js - Arquivo de constantes para locations
export const LOCALIZACOES = [
    'São Paulo - SP (Matriz)',
    'Rio de Janeiro - RJ',
    'Salvador - BA',
    'Vitória - ES',
    'Belém - PA',
    'Recife - PE',
    'Belo Horizonte - MG',
    'Goiânia - GO',
    'Porto Alegre - RS',
    'Fortaleza - CE',
    'Brasília - DF',
    'Curitiba - PR',
    'Balneário Camboriú - SC',
    'Floripa - SC',
    'Ribeirão Preto - SP',
    'Uberlândia - MG',
    'Campinas - SP',
    'Campo Grande - MS',
    'Caxias do Sul - RS',
    'Cuiabá - MT',
    'João Pessoa - PB',
    'Londrina - PR',
    'Manaus - AM',
    'Natal - RN',
    'Porto Seguro - BA',
    'Santos - SP'
  ];
  
  // Função helper para obter opções para Select do Ant Design
  export const getLocalizacoesOptions = () => {
    return LOCALIZACOES.map(loc => ({
      label: loc,
      value: loc
    }));
  };
  
  export default LOCALIZACOES;