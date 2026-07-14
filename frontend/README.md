# Frontend - Sistema de Gestão Financeira Universitária

Frontend MVP em React, React Router DOM, Axios, CSS e Recharts.

## Endpoints consumidos

- Cadastro: `POST /auth/register`
- Login: `POST /auth/login`
- Sessão: `GET /auth/me`
- Dashboard: `GET /dashboard/monthly-summary`, `GET /dashboard/category-expenses`, `GET /dashboard/alerts`
- Receitas: `GET /incomes`, `POST /incomes`, `PUT /incomes/:id`, `DELETE /incomes/:id`
- Despesas: `GET /expenses`, `POST /expenses`, `PUT /expenses/:id`, `DELETE /expenses/:id`
- Categorias: `GET /categories`
- Categorias personalizadas: `POST /categories`, `PUT /categories/:id`, `DELETE /categories/:id`
- Limites: `GET /category-limits`, `POST /category-limits`, `PUT /category-limits/:id`
- Metas: `GET /monthly-goals`, `POST /monthly-goals`, `PUT /monthly-goals/:id`
- Relatório mensal: `GET /reports/monthly`
- Exportação CSV: `GET /reports/export`
- Histórico: `GET /reports/monthly-history`
- Perfil financeiro opcional: `GET /financial-profile`

## Instalação

```bash
cd frontend
npm install
```

## Configuração da API

Crie um arquivo `.env` dentro de `frontend/` com base em `.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

Se o backend estiver rodando em outra porta, altere esse valor. Por exemplo:

```env
VITE_API_URL=http://localhost:3333
```

Depois de alterar `.env`, reinicie o servidor do frontend.

## Rodar o frontend

```bash
npm run dev
```

URL padrão do Vite:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

## Ordem recomendada para testar

1. Inicie o backend e confirme a URL configurada em `VITE_API_URL`.
2. Rode o frontend com `npm run dev`.
3. Acesse `http://localhost:5173/register` e crie um usuário.
4. Faça login em `http://localhost:5173/login`.
5. Abra `Categorias e limites` para confirmar as categorias padrão e cadastrar uma categoria personalizada.
6. Cadastre uma meta mensal em `Metas`.
7. Cadastre limites por categoria em `Limites`.
8. Cadastre receitas em `Receitas`.
9. Cadastre despesas em `Despesas`.
10. Volte ao `Dashboard` para conferir totais, gráfico e alertas.
11. Abra `Relatórios` para consultar o resumo detalhado e exportar CSV.
12. Abra `Histórico` para consultar a evolução mensal.
13. Use `Sair` para testar logout e proteção das rotas privadas.

## Possíveis ajustes de campos

O frontend foi implementado para os campos do backend MVP:

- Receita: `description`, `amount`, `date`, `source`, `isRecurring`, `notes`
- Despesa: `description`, `amount`, `date`, `categoryId`, `expenseType`, `paymentMethod`, `isRecurring`, `notes`
- Meta: `month`, `year`, `targetAmount`
- Limite: `categoryId`, `month`, `year`, `limitAmount`
- Categoria personalizada: `name`, `description`

Enums usados:

```text
expenseType: FIXED, VARIABLE
paymentMethod: CASH, PIX, DEBIT_CARD, CREDIT_CARD, BANK_SLIP, BANK_TRANSFER, OTHER
```

Se o backend usar nomes em snake_case, ajuste os payloads em `src/services/financeService.js` ou nos formulários das páginas correspondentes.
