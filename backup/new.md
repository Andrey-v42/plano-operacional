# RELATÓRIO DE PILOTAGEM
## SISTEMA FIELD ZIGGER 2.0 + MÓDULO DE CHAMADOS

---

## 1. RESUMO

Este documento apresenta o relatório da pilotagem do Sistema Field Zigger 2.0 com o Módulo de Chamados, realizada durante o projeto **INTENSO SP 2025**. A pilotagem identificou pontos positivos e oportunidades de melhoria que serão detalhados ao longo deste documento.

---

## 2. INFORMAÇÕES GERAIS

| Item | Detalhe |
|:-----|:--------|
| **Data da Pilotagem:** | 22/03/2025 |
| **Horário de Início:** | 19h00 |
| **Ambiente:** | Evento operacional em tempo real |
| **Responsável pelo Relatório:** | Andrey Henrique Adorno Müller |

---

## 3. CASOS DE USO TESTADOS

### 3.1. Gestão de Chamados

- ✅ Abertura de chamado para alteração de cardápio
- ✅ Fluxo completo: abertura → análise → resposta (sem validação da produção)
- ✅ Reabertura de chamado após resolução parcial
- ✅ Envio e armazenamento de anexos
- ✅ Entrega e devolução de pontos de venda com assinatura do parceiro responsável

### 3.2. Funcionalidades Administrativas

- ✅ Gestão de categorias e classificações
- ✅ Dashboard de métricas e tempos de atendimento
- ✅ Sistema de notificações
- ✅ Autenticação de usuários

---  
  
  
  
## 4. PROBLEMAS IDENTIFICADOS E SOLUÇÕES APLICADAS

### 4.1. Problemas no Módulo de Chamados

| Problema | Solução | Status |
|:---------|:--------|:------:|
| Métrica de tempo em análise no dashboard zerada | Ajuste no cálculo para considerar tanto transições "Em Análise → Em Validação" quanto "Em Análise → Resolvido" | ✅ Resolvido |
| Ausência da categoria "Cartão de senha" | Inclusão da classificação "Criação de cartão de senhas" do ECC | ✅ Resolvido |
| Falta de opção para registrar chamados improcedentes | Adição da opção "N/A" na classificação do ECC como solução paliativa | ✅ Resolvido |
| Sobrescrita de imagens com mesmo nome no banco de dados | Identificado modelo de armazenamento inadequado: "pipe/pipeId_{pipeId}/chamados/{nomeDoUsuario}/{nomeDoArquivo}" | ✅ Resolvido |

### 4.2. Problemas de Compatibilidade

| Dispositivo | Problema | Causa | Solução |
|:------------|:---------|:------|:--------|
| iPhones | Falha no recebimento de notificações | Limitações de segurança do iOS com service workers para notificações em background | ⚠️ Pendente |
| Celulares Android antigos | Falha em notificações e localização | Incompatibilidade com APIs modernas | ✅ Modificada função de registro de ponto para setar latitude e longitude como 0 quando navegador não suporta serviços de localização |

### 4.3. Problemas de Autenticação

| Problema | Solução | Status |
|:---------|:--------|:------:|
| Falha no login devido a espaços no final dos nomes na pasta de gestão de equipe técnica no Clickup | Adicionadas funções trim() e toLowerCase() na comparação dos nomes | ✅ Resolvido |

---

## 5. REQUISITOS ADICIONAIS IDENTIFICADOS

- 📎 Implementação de envio de anexos no chat
- 🔔 Melhoria no fluxo de notificações para garantir visualização pelos técnicos
- 🖥️ Otimização da interface para uso em situações de alta demanda operacional

---

## 6. FEEDBACK DOS USUÁRIOS

Aproximadamente à meia-noite, a head do projeto solicitou o retorno ao WhatsApp devido ao ritmo acelerado do evento e à dificuldade de adaptação ao novo sistema. O feedback indicou que, apesar dos problemas pontuais que foram resolvidos rapidamente, o sistema é utilizável, porém apresenta desafios quando há apenas uma pessoa responsável por liderar o projeto e responder aos chamados simultaneamente.

---

## 7. CONCLUSÕES E RECOMENDAÇÕES

### 7.1. Conclusões

- ✅ O sistema é funcionalmente viável, com problemas pontuais que foram majoritariamente resolvidos durante a pilotagem.
- ⚠️ A experiência do usuário precisa ser otimizada para cenários de alta pressão operacional.
- 🔔 O sistema de notificações requer aprimoramentos para garantir efetividade em diferentes dispositivos.

### 7.2. Recomendações

- 📂 Implementar sistema de nomeação de arquivos que evite sobrescrita (ex: incluir timestamp ou ID único)
- 📱 Desenvolver solução alternativa de notificações para dispositivos iOS
- 🖥️ Simplificar interface para operações sob pressão
- 📎 Implementar função de anexos no chat
- 📱 Considerar versão mobile otimizada para facilitar uso em campo
- 👨‍🏫 Realizar treinamento adicional com a equipe técnica antes da implementação completa

---

## 8. PRÓXIMOS PASSOS

1. 🐛 Corrigir bugs pendentes identificados durante a pilotagem
2. ⚡ Implementar melhorias prioritárias (sistema de notificações e anexos no chat)
3. 🧪 Agendar nova pilotagem com equipe completa em ambiente controlado
4. 📚 Desenvolver documentação e guia rápido para usuários

---

**Relatório elaborado por:** Andrey Henrique Adorno Müller  
**Data de elaboração:** 23/03/2025