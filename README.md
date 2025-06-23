# User Management API – Backend

Este projeto é o backend de um sistema de gerenciamento de usuários, desenvolvido como parte de um desafio técnico para a Conéctar. O objetivo é criar uma solução robusta, segura e escalável, utilizando NestJS e TypeScript.

## Sobre o Desafio

O sistema simula uma ferramenta interna para cadastro, autenticação e administração de usuários. O backend expõe uma API RESTful, documentada via Swagger, e implementa autenticação JWT e Oauth, controle de permissões e operações CRUD completas.

## Funcionalidades

- Cadastro e autenticação de usuários (JWT, OAuth)
- Permissões por papel (admin e usuário comum)
- CRUD de usuários
- Filtros e ordenação por papel, nome e data de criação
- Listagem de usuários inativos (sem login nos últimos 30 dias)
- Testes automatizados (unitários e integração)

## Especificação dos Usuários
- **id**: Identificador único
- **name**: Nome completo
- **email**: E-mail único
- **password**: Senha criptografada
- **role**: admin ou user
- **createdAt**: Data de criação
- **updatedAt**: Data de atualização

## Rotas Principais
- `POST /auth/register` – Cadastro de usuário
- `POST /auth/login` – Login e geração de token JWT
- `GET /users` – Listagem de usuários (apenas admin)
- `GET /users/:id` – Detalhes do usuário
- `PUT /users/:id` – Atualização de dados
- `DELETE /users/:id` – Exclusão (apenas admin)
- `GET /users/inactive` – Listar usuários inativos

## Tecnologias Utilizadas
- **Framework:** NestJS (com TypeScript)
- **Banco de Dados:** PostgreSQL
- **ORM:** TypeORM
- **Autenticação:** OAuth, JWT, bcrypt
- **Testes:** Jest
- **Documentação:** Swagger

## Como rodar o projeto

1. Clone o repositório:
   ```bash
   git clone <url-do-repo>
   cd user-management
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o banco de dados em `.env` (exemplo disponível no projeto).
4. Rode as migrations (se houver):
   ```bash
   npm run typeorm migration:run
   ```
5. Inicie o servidor:
   ```bash
   npm run start:dev
   ```
6. Acesse a documentação da API em `/api` (Swagger).

## Testes
- Testes unitários: `npm run test`
- Testes de integração: `npm run test:e2e`
- Cobertura: `npm run test:cov`

## Decisões de Arquitetura

### Modularização e Separação de Domínios

O projeto foi estruturado seguindo a arquitetura modular do NestJS, separando claramente os domínios de autenticação (auth) e usuários (user). Cada domínio possui seus próprios controllers, services, DTOs e módulos, facilitando a manutenção, testes e escalabilidade. Um CoreModule centraliza providers globais e configurações compartilhadas (algo que por questão de tempo não foi possível de se fazer as refatorações
que pretendia para mover a proteção de rotas, pipes de validação e outros recursos para o CoreModule).

### Integração com TypeORM e Configuração Robusta

A integração com o TypeORM permite o uso de repositórios e entidades fortemente tipadas, facilitando queries e migrações. A configuração do banco e variáveis de ambiente é feita via @nestjs/config e validada com Joi, garantindo robustez e evitando erros de configuração.

### Autenticação e Segurança

A autenticação é baseada em JWT para fluxos tradicionais e OAuth 2.0 para login social (Google, podendo ser expandido). O fluxo social utiliza campos opcionais na entidade User (provider, providerId, password), permitindo coexistência de usuários tradicionais e sociais. As senhas são sempre criptografadas com bcrypt. O controle de acesso é feito por decorators e guards, garantindo que apenas administradores possam acessar rotas sensíveis.

### Documentação e Decorators Customizados

A documentação da API é gerada automaticamente via Swagger, com decorators customizados para detalhar responses, exemplos de erro e parâmetros de busca. Isso facilita o entendimento da API por outros desenvolvedores e garante padronização das respostas.

### Validação e DTOs

Toda entrada de dados é validada por DTOs e pipes globais (ValidationPipe), prevenindo dados inválidos e ataques comuns. DTOs distintos foram criados para cadastro tradicional e social, além de respostas e queries, promovendo clareza e segurança.

### Paginação, Filtros e Usuários Inativos

A listagem de usuários suporta paginação, filtro por papel e ordenação por nome/data de criação. O endpoint de usuários inativos identifica contas sem login nos últimos 30 dias ou nunca logadas, atendendo requisitos de negócio e facilitando auditoria.

### Testes Automatizados

Foram implementados testes unitários (UserService, AuthService) e de integração (e2e) cobrindo fluxos principais, RBAC, login social e casos de conflito. Mocks garantem isolamento dos testes e cobertura de cenários reais.

### Limitações e Pontos de Atenção

- O Swagger não executa fluxos OAuth2 completos, mas a documentação explica como testar manualmente.
- Infelizmente, por questões de tempo, não foi possível fazer proveito do uso do CoreModule.
- O projeto pode ser facilmente expandido para outros provedores sociais.
- Práticas de segurança incluem hash de senha, uso de refresh token, RBAC e validação rigorosa de entrada.

### Justificativa das Escolhas

Essas decisões garantem um sistema escalável, seguro, fácil de manter e pronto para evoluir. A modularização permite crescimento do código sem perda de clareza. O uso de decorators e validação forte reduz bugs e facilita integração. A documentação detalhada e os testes automatizados promovem qualidade e confiança no sistema.

## Diferenciais
- Integração opcional com login social (Google/Microsoft) via OAuth 2.0.

## Checklist do Desafio
- [x] Cadastro de usuários
- [x] Autenticação com JWT
- [x] Autenticação via OAuth (Google/Microsoft, opcional mas preferível)
- [x] CRUD completo de usuários
- [x] Permissões por papel (admin/user)
- [x] Filtros e ordenação na listagem de usuários
- [x] Listagem de usuários inativos (sem login nos últimos 30 dias)
- [x] Testes unitários
- [x] Testes de integração (e2e)
- [x] Documentação da API com Swagger
- [x] Explicação das decisões de arquitetura
- [ ] Deploy e demonstração (opcional, mas preferível)