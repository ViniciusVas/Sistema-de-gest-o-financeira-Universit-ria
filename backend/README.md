# Backend - Sistema de Gestao Financeira Universitaria

Backend MVP em Node.js, Express, Prisma, PostgreSQL, JWT e bcrypt.

## Estrutura

```text
backend/
  prisma/
    schema.prisma
    seed.js
  src/
    config/
    controllers/
    middlewares/
    repositories/
    routes/
    services/
    utils/
    app.js
    server.js
```

## Instalacao

```bash
cd backend
npm install
```

## Configuracao do .env

Crie um arquivo `.env` dentro de `backend/` com base em `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_university?schema=public"
JWT_SECRET="troque_este_segredo_por_um_valor_longo_e_seguro"
JWT_EXPIRES_IN="1d"
PORT=3333
```

## Banco de dados e Prisma

Crie o banco PostgreSQL informado em `DATABASE_URL`. Depois rode:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Para abrir o Prisma Studio:

```bash
npm run prisma:studio
```

## Rodar o backend

Ambiente de desenvolvimento:

```bash
npm run dev
```

Ambiente normal:

```bash
npm start
```

URL base:

```text
http://localhost:3333
```

Health check:

```http
GET /health
```

## Autenticacao

As rotas internas exigem header:

```http
Authorization: Bearer SEU_TOKEN_JWT
```

## Exemplos para Postman ou Insomnia

### Cadastro

```http
POST http://localhost:3333/auth/register
Content-Type: application/json
```

```json
{
  "name": "Aluno Teste",
  "email": "aluno@teste.com",
  "password": "123456"
}
```

### Login

```http
POST http://localhost:3333/auth/login
Content-Type: application/json
```

```json
{
  "email": "aluno@teste.com",
  "password": "123456"
}
```

### Usuario autenticado

```http
GET http://localhost:3333/auth/me
Authorization: Bearer SEU_TOKEN_JWT
```

### Listar categorias padrao

```http
GET http://localhost:3333/categories
Authorization: Bearer SEU_TOKEN_JWT
```

### Criar categoria personalizada

```http
POST http://localhost:3333/categories
Authorization: Bearer SEU_TOKEN_JWT
Content-Type: application/json
```

```json
{
  "name": "Academia",
  "description": "Mensalidade e gastos com atividade fisica"
}
```

### Atualizar categoria personalizada

```http
PUT http://localhost:3333/categories/ID_DA_CATEGORIA
Authorization: Bearer SEU_TOKEN_JWT
Content-Type: application/json
```

```json
{
  "name": "Saude e academia",
  "description": "Gastos com saude, academia e bem-estar"
}
```

### Excluir categoria personalizada

```http
DELETE http://localhost:3333/categories/ID_DA_CATEGORIA
Authorization: Bearer SEU_TOKEN_JWT
```

### Criar receita

```http
POST http://localhost:3333/incomes
Authorization: Bearer SEU_TOKEN_JWT
Content-Type: application/json
```

```json
{
  "description": "Bolsa de estudos",
  "amount": 800,
  "date": "2026-07-05",
  "source": "Bolsa",
  "isRecurring": true,
  "notes": "Bolsa mensal"
}
```

### Listar receitas do mes

```http
GET http://localhost:3333/incomes?month=7&year=2026
Authorization: Bearer SEU_TOKEN_JWT
```

### Atualizar receita

```http
PUT http://localhost:3333/incomes/ID_DA_RECEITA
Authorization: Bearer SEU_TOKEN_JWT
Content-Type: application/json
```

```json
{
  "amount": 850,
  "notes": "Valor atualizado"
}
```

### Excluir receita

```http
DELETE http://localhost:3333/incomes/ID_DA_RECEITA
Authorization: Bearer SEU_TOKEN_JWT
```

### Criar despesa

Use um `categoryId` retornado em `GET /categories`.

```http
POST http://localhost:3333/expenses
Authorization: Bearer SEU_TOKEN_JWT
Content-Type: application/json
```

```json
{
  "description": "Almoco no campus",
  "amount": 18.5,
  "date": "2026-07-08",
  "categoryId": "ID_DA_CATEGORIA",
  "expenseType": "VARIABLE",
  "paymentMethod": "PIX",
  "isRecurring": false,
  "notes": "Restaurante universitario"
}
```

### Listar despesas com filtros

```http
GET http://localhost:3333/expenses?month=7&year=2026&expenseType=VARIABLE&paymentMethod=PIX
Authorization: Bearer SEU_TOKEN_JWT
```

### Atualizar despesa

```http
PUT http://localhost:3333/expenses/ID_DA_DESPESA
Authorization: Bearer SEU_TOKEN_JWT
Content-Type: application/json
```

```json
{
  "amount": 20,
  "paymentMethod": "DEBIT_CARD"
}
```

### Excluir despesa

```http
DELETE http://localhost:3333/expenses/ID_DA_DESPESA
Authorization: Bearer SEU_TOKEN_JWT
```

### Criar ou atualizar meta mensal

```http
POST http://localhost:3333/monthly-goals
Authorization: Bearer SEU_TOKEN_JWT
Content-Type: application/json
```

```json
{
  "month": 7,
  "year": 2026,
  "targetAmount": 200
}
```

### Listar metas

```http
GET http://localhost:3333/monthly-goals?month=7&year=2026
Authorization: Bearer SEU_TOKEN_JWT
```

### Criar ou atualizar limite por categoria

```http
POST http://localhost:3333/category-limits
Authorization: Bearer SEU_TOKEN_JWT
Content-Type: application/json
```

```json
{
  "categoryId": "ID_DA_CATEGORIA",
  "month": 7,
  "year": 2026,
  "limitAmount": 500
}
```

### Listar limites por categoria

```http
GET http://localhost:3333/category-limits?month=7&year=2026
Authorization: Bearer SEU_TOKEN_JWT
```

### Dashboard - resumo mensal

```http
GET http://localhost:3333/dashboard/monthly-summary?month=7&year=2026
Authorization: Bearer SEU_TOKEN_JWT
```

Retorna:

```json
{
  "month": 7,
  "year": 2026,
  "totalIncomes": 800,
  "totalExpenses": 18.5,
  "balance": 781.5,
  "fixedExpenses": 0,
  "variableExpenses": 18.5,
  "goal": {
    "id": "ID_DA_META",
    "targetAmount": 200,
    "progressPercentage": 390.75,
    "achieved": true,
    "missingAmount": 0
  }
}
```

### Dashboard - gastos por categoria

```http
GET http://localhost:3333/dashboard/category-expenses?month=7&year=2026
Authorization: Bearer SEU_TOKEN_JWT
```

### Dashboard - alertas de limite

```http
GET http://localhost:3333/dashboard/alerts?month=7&year=2026
Authorization: Bearer SEU_TOKEN_JWT
```

Status possiveis dos alertas:

```text
normal
attention
high_risk
exceeded
```

### Relatorios - historico mensal

```http
GET http://localhost:3333/reports/monthly-history?year=2026
Authorization: Bearer SEU_TOKEN_JWT
```

Retorna os meses com receitas, despesas, saldo e status da meta:

```json
{
  "year": 2026,
  "history": [
    {
      "month": 7,
      "year": 2026,
      "totalIncomes": 800,
      "totalExpenses": 18.5,
      "balance": 781.5,
      "goal": {
        "targetAmount": 200,
        "achieved": true,
        "missingAmount": 0,
        "progressPercentage": 390.75
      }
    }
  ]
}
```

### Relatorios - resumo mensal detalhado

```http
GET http://localhost:3333/reports/monthly?month=7&year=2026
Authorization: Bearer SEU_TOKEN_JWT
```

Retorna totais, meta, gastos por categoria, limites ultrapassados e movimentacoes do mes.

### Relatorios - exportar CSV

```http
GET http://localhost:3333/reports/export?month=7&year=2026
Authorization: Bearer SEU_TOKEN_JWT
```

## Enums aceitos

`expenseType`:

```text
FIXED
VARIABLE
```

`paymentMethod`:

```text
CASH
PIX
DEBIT_CARD
CREDIT_CARD
BANK_SLIP
BANK_TRANSFER
OTHER
```
