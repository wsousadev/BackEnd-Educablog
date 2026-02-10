import { initializeDatabase, createTables, closeDatabaseConnection } from './src/lib/pg/db.init.js';
import { Client } from 'pg';
import { beforeAll, afterAll } from 'vitest';

const PG_CONFIG = {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST || 'localhost',
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
};
const TEST_DATABASE_NAME = process.env.POSTGRES_DB + '_test';

async function createTestDatabase() {
    console.log(`[SETUP] Iniciando DROP/CREATE para: ${TEST_DATABASE_NAME}`);

    const client = new Client({
        ...PG_CONFIG,
        database: 'postgres',
    });

    try {
        await client.connect();
        await client.query(`SELECT pg_terminate_backend(pid) 
                            FROM pg_stat_activity 
                            WHERE datname = '${TEST_DATABASE_NAME}'
                            AND pid <> pg_backend_pid();`);

        await new Promise(resolve => setTimeout(resolve, 1000));

        await client.query(`DROP DATABASE IF EXISTS "${TEST_DATABASE_NAME}";`);
        console.log(`[SETUP] Banco de dados anterior removido.`);

        await client.query(`CREATE DATABASE "${TEST_DATABASE_NAME}" WITH OWNER = ${PG_CONFIG.user};`);
        console.log(`[SETUP] Novo banco de dados de teste criado.`);

    } catch (error) {
        console.error('[SETUP] Tentativa de criação do banco de testes falhou:', error.message);
        throw error;
    } finally {
        await client.end();
    }
}

beforeAll(async () => {
    const MAX_ATTEMPTS = 5;
    for (let attempts = 1; attempts <= MAX_ATTEMPTS; attempts++) {
        try {
            await createTestDatabase();

            console.log('[SETUP] Aguardando 2000ms para estabilização do PostgreSQL antes de conectar o TypeORM...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            await initializeDatabase();

            await createTables();

            console.log(`[SETUP] Configuração do DB finalizada com sucesso na tentativa ${attempts}.`);
            return;
        } catch (error) {
            if (attempts === MAX_ATTEMPTS) {
                console.error(`[SETUP] Falha crítica após ${MAX_ATTEMPTS} tentativas. Abortando.`);
                throw error;
            }
            console.warn(`[SETUP] Tentativa ${attempts} de configuração falhou. Retentando em 2 segundos...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
});

// Roda UMA VEZ depois de todos os testes
afterAll(async () => {
    // Fecha a conexão do TypeORM e destrói o DB de teste
    await closeDatabaseConnection();
});
