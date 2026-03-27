---
description: "Regras para handlers de rota e contratos HTTP da Orion API"
applyTo: "src/routes/**/*.ts"
---

# Regras de Rotas API

1. Declarar schema zod para querystring, params e body quando aplicavel.
2. Declarar schema de response para codigos de status esperados.
3. Aplicar preHandler de autenticacao/autorizacao quando necessario.
4. Manter handler enxuto, delegando regra de negocio para usecase.
5. Retornar erros com formato consistente de erro e codigo.
6. Evitar side effects nao relacionados ao caso de uso da rota.
7. Garantir nomes de campos coerentes com contratos existentes.
