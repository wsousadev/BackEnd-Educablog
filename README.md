# Pós Tech Fiap - Segunda Etapa

Bem-vindo ao projeto Educablog da segunda fase da PósTech em Full Stack Development FIAP! 

Este repositório contém o código-fonte e o Dockerfile para rodar a aplicação em um ambiente de container. 
Caso não deseje utilizar o Docker é possível rodar a aplicação localmente.

## 📦 Requisitos

Antes de começar, é necessário ter os pacotes mais recentes do Node, Docker e o Docker Compose instalados em sua máquina na sua última versão.

-   [**Node**](https://www.nodejs.tech/pt-br) 
-   [**Docker Desktop**](https://www.docker.com/products/docker-desktop/) (recomendado para Windows e macOS)
-   [**Docker Engine**](https://docs.docker.com/engine/install/) e [**Docker Compose Plugin**](https://docs.docker.com/compose/install/linux/) (para Linux)

## 🔧 Configurações de Ambiente (.env)

Antes de iniciar a aplicação, é necessário configurar os arquivos `.env` com as variáveis de ambiente adequadas. Este projeto utiliza múltiplos ambientes, e você pode definir configurações específicas nos arquivos:

- `.env` – configurações padrão
- `.env.production` – ambiente de produção
- `.env.development` – ambiente de desenvolvimento
- `.env.test` – ambiente de testes

Abaixo estão as variáveis utilizadas e seus significados:

```env
# Ambiente da aplicação
ENVIRONMENT=production

# Chave secreta usada para assinar tokens JWT
JWT_SECRET=SEGREDO_FORTE_PARA_PRODUCAO

# Configurações do banco de dados PostgreSQL
POSTGRES_HOST=localhost           # Host do banco 
POSTGRES_DB=educablog             # Nome do banco de dados
POSTGRES_USER=postgres            # Usuário do banco
POSTGRES_PASSWORD=123456          # Senha do banco
POSTGRES_PORT=5432                # Porta padrão do PostgreSQL
```

## 💻 Como Iniciar a Aplicação

Siga os passos abaixo para subir a aplicação e todos os serviços de banco de dados.

1. **Navegue até o diretório raiz do projeto:**
    Abra o seu terminal e vá para a pasta onde o arquivo `docker-compose.yml` está localizado.

2. **Inicie os serviços:**
    Execute o seguinte comando para construir as imagens e iniciar todos os containers em segundo plano.

```bash
  docker compose up --build -d
```

    -   `up`: Inicia os serviços.
    -   `--build`: Reconstroi a imagem do seu aplicativo a partir do `Dockerfile`. Use isso quando tiver feito alterações no código.
    -   `-d`: Executa os containers em modo **detached** (segundo plano).

A primeira execução pode demorar um pouco, pois o Docker precisa baixar as imagens do banco de dados e construir a imagem da sua aplicação.

---

### 🧪 Ambiente de Testes

Realize a instalação de todas as depedências do projeto com o comando:

```bash
npm install
```

Use este modo para rodar os testes automatizados da aplicação:

```bash
npm run test
```
<!-- Resultado esperado -->
```bash
[TEST DB] Banco de dados "educablog_test" destruído após os testes.

 ✓ __tests__/home.test.js (1) 10062ms
 ✓ __tests__/posts.test.js (10) 9325ms
 ✓ __tests__/user.test.js (11) 12697ms

 Test Files  3 passed (3)
      Tests  22 passed (22)
   Start at  21:18:28
   Duration  13.92s (transform 95ms, setup 1.35s, collect 1.38s, tests 32.08s, environment 0ms, prepare 302ms)

 PASS  Waiting for file changes...
       press h to show help, press q to quit
```
---

### 🛠️ Ambiente de Desenvolvimento

Ideal para desenvolvimento local com hot reload e logs detalhados:

```bash
npm run dev
```
<!-- Resultado esperado -->
```bash
✅ Bootstrap do banco de dados concluído com sucesso. Servidor liberado para requisições.
[SERVER] Servidor ativo !
App rodando em http://localhost:3000
```

Certifique-se de que o arquivo .env.development está configurado 
corretamente.

---

### 🚀 Ambiente de Produção

Quando o Docker é executado o comando abaixo é iniciado junto com o container, caso deseje testar fora do ambiente de container é possível utiliza-lo também

```bash
npm run prod
```
---

### 🐳 Ambiente de Produção com Docker

Para verificar se os containers estão rodando:

```bash
docker compose ps
```

Para verificar o consumo dos containers:

```bash
docker compose stats
```

Para parar todos os serviços e excluir os volumes:

```bash
docker compose down -v
```

---

### 🗄️ Acessando o Banco de Dados

- #### 🔍 Dentro do Docker

Para acessar o banco de dados PostgreSQL rodando no container:

1. Liste os containers ativos:

```bash
docker compose ps
```

2. Acesse o container do PostgreSQL:

```bash
docker exec -it educablog_db bash
```

3. Acesse o banco de dados:

```bash
psql -h localhost -p 5432 -U postgres -d educablog
```
---

## 📘 Documentação

Caso deseje verificar os endpoints é possível consultar a documentação em Swagger.

### SWAGGER: http://localhost:3000/api-docs

### JSON: http://localhost:3000/swagger.json
