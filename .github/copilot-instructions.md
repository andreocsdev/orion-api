# Orion API - Instrucoes Sempre Ativas

Estas instrucoes se aplicam a todo trabalho no repositorio.

## Prioridades

1. Preservar comportamento existente e evitar regressao.
2. Fazer mudancas minimas e focadas no pedido.
3. Manter consistencia entre rotas, usecases, schema e camada de dados.

## Arquitetura da API

1. Manter padrao de rotas em src/routes com contratos claros.
2. Regras de negocio devem ficar na camada de usecases.
3. Guardas de autenticacao/autorizacao devem ser aplicadas em rotas protegidas.
4. Evitar logica de negocio complexa diretamente no handler da rota.

## Validacao e contratos

1. Toda entrada de rota deve ser validada por schema zod (params, querystring e body quando aplicavel).
2. Toda rota deve declarar schemas de resposta para status relevantes.
3. Reutilizar ErrorSchema para respostas de erro padrao quando aplicavel.
4. Preservar consistencia de tipos e nomes de campos entre camada HTTP e usecases.

## Seguranca

1. Nao expor dados sensiveis em logs, mensagens de erro ou payloads.
2. Aplicar requireAuth ou requireRole conforme necessidade de acesso.
3. Nao confiar em dados do cliente sem validacao.
4. Em alteracoes de autorizacao, garantir cobertura dos caminhos 401 e 403.

## Prisma e dados

1. Manter consistencia com schema.prisma e convencoes de relacionamento existentes.
2. Evitar mudancas de schema sem avaliar impacto nos usecases e contratos HTTP.
3. Ao alterar estrutura de dados, atualizar tipos e consultas afetadas no mesmo fluxo.

## Qualidade de mudanca

1. Preferir alteracoes pequenas e verificaveis.
2. Nao refatorar fora do escopo sem necessidade tecnica.
3. Se identificar risco de regressao, explicitar no resultado com sugestao de verificacao.

## Quando fizer revisao de codigo

1. Priorizar bugs, regressao funcional, seguranca e quebra de contrato.
2. Reportar achados por severidade e impacto.
3. Sugerir testes de rota e de regra de negocio para pontos criticos.
