# Sistema de Emissão de Notas Fiscais

## Visão Geral

Projeto desenvolvido para o teste técnico utilizando C# + Angular +SQLite

## Stack

### Backend (C# .NET 8)
- **Frameworks**: ASP.NET Core (APIs REST), Entity Framework Core (ORM para SQLite).
- **Dependências (NuGet)**:
  - `Sqlite`: Banco de dados local (stock.db, billing.db).
  - `Polly Http`: Retries automáticos em chamadas HTTP.
  - `Microsoft Http`: HttpClient factory para injeção de dependências.
  - `Swashbuckle`: utilizado para testar as APIs e interagir com elas nos endpoints `http://localhost:5000/swagger/` e `http://localhost:5001/swagger/`
- **Banco de Dados**: SQLite

### Frontend (Angular 19)
- **Framework**: Angular standalone components 
- **Bibliotecas (npm)**:
  - `@angular/material`: Geração de componentes visuais prontos do Angular
  - `@angular/cdk`: Suporte ao Material e reutilização de lógica de componentes prontos
- **RxJS**: Gerenciamento de HTTP (subscribe, catchError, finalize).

### Opcionais
- Concorrência: Lock em atualização de saldo no backend.
- IA: Resumo de nota via Groq API (chave protegida via User Secrets).

## Detalhamento técnico
- Utilização do ngOnInit no ciclo de vida do Angular.
- Uso da biblioteca RxJS para programação reativa, recebendo um Observable<object> das chamadas feitas para o back-end e convertendo seus dados para tipos específicos a serem declarados dentro dos componentes.
- Angular Material e o CDK para implementação de componentes visuais.
- ASP.NET para o desenvolvimento web baseado em C#, permitindo a construção de APIs Rest
- No back-end, os status das operações eram retornados ao front-end, como No-Content, BadRequest ou OK. Os erros eram capturados no front-end através do `catchError` e eram exibidas mensagens personalizadas de erros na tela do usuário e o log do erro completo no console.
- Utilizei o LINQ no método CreateInvoice para calcular o próximo número sequencial das faturas de forma otimizada.
  ```
  invoice.Number = (_context.Invoices.Max(i => (int?)i.Number) ?? 0) + 1;
  ```
  
## Arquitetura

- **Microsserviços**:
  - **Stock-Service** (porta 5000): Gerencia produtos e saldos.
  - **Billing-Service** (porta 5001): Gerencia notas fiscais.
- **Comunicação**: HttpClient.

### Fluxo Principal
1. **Cadastro de Produtos**: Form com validators.
2. **Cadastro de Notas**: FormArray para itens, validação qty <= saldo (custom validator). POST ao billing-service (gera número sequencial).
3. **Impressão**: Botão em detail (apenas se "Open"), spinner durante processamento, atualiza status "Closed" e subtrai saldo.
4. **Cancelar Nota**: Botão em list: Exclui se "Open"; estorna saldo se "Closed".
5. **Falhas**: CatchError redireciona para erro page genérica se o stock estiver offline.

### Tratamento de Falhas
- Frontend: CatchError + redirecionamento para `/error/server-down` (uma página que exibe um template com erro 503).
- Backend: Middleware global, transações rollback.
- O botão de 'Print', por exemplo, é desativado assim que é impresso uma fatura, evitando operações repetitivas e garantindo a consistência de uma única transação processada pelo back-end.
- 
## Como Rodar o Projeto

### Pré-requisitos
- .NET SDK 9.
- API key do Groq (crie uma em ```https://console.groq.com/keys```
- Node.js 18+ e Angular CLI 17+ (`npm i -g @angular/cli`).
- Git para clone.

### Backend
1. Clone o repo: `git clone https://github.com/lcssathler/Korp_Teste_Lucas_Sathler && cd backend`.
2. **Stock-Service**:
```
cd stock-service
dotnet restore
dotnet run
```
- Acessa http://localhost:5000 (Swagger: /swagger).
3. **Billing-Service** (em terminal separado):
```
cd billing-service
dotnet restore
dotnet user-secrets set "GroqApiKey" "{sua_api_do_groq}"
dotnet run
```
- Acessa http://localhost:5001 (Swagger: /swagger).

### Frontend
1. `cd frontend`.
2. `npm install`.
3. `ng serve` – Acessa http://localhost:4200.
