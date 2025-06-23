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
- O projeto segue arquitetura modular do NestJS, facilitando manutenção e escalabilidade.
- Autenticação baseada em JWT e OAuth para garantir segurança e flexibilidade.
- Permissões controladas por papel, com middleware para proteger rotas sensíveis.
- Documentação automática via Swagger.

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
- [ ] Explicação das decisões de arquitetura
- [ ] Deploy e demonstração (opcional, mas preferível)