import request from 'supertest';
import { describe, test, expect, afterEach, beforeAll, afterAll } from 'vitest';
// import jwt from 'jsonwebtoken';

import app from '../app.js';
import UserRepository from '../src/models/user.model.js';

let authToken;
let authUserId;

const testUserAuthPayload = {
    nome: 'User Autenticado',
    email: 'auth.user@escola.com',
    password: 'senhaSegura123',
    user_type: 'ALUNO',
    serie: '9º Ano',
};

beforeAll(async () => {
    const createdUser = await UserRepository.create(testUserAuthPayload);
    authUserId = createdUser.id;

    const response = await request(app)
        .post('/auth/login')
        .send({
            email: testUserAuthPayload.email,
            password: testUserAuthPayload.password,
        });

    expect(response.statusCode).toBe(200);
    authToken = response.body.token;
    expect(authToken).toBeDefined();
});

afterAll(async () => {
    if (authUserId) {
        await UserRepository.remove(authUserId);
    }
});


afterEach(async () => {
    const user = await UserRepository.findByEmail('novo.teste@escola.com');
    if (user) {
        await UserRepository.remove(user.id);
    }
});

describe('POST /users/register (Unauthenticated)', () => {

    const validUserPayload = {
        nome: 'Novo Teste',
        email: 'novo.teste@escola.com',
        password: 'senhaSegura123',
        user_type: 'ALUNO',
        serie: '8º Ano',
    };

    test('1. Deve registrar um novo usuário com sucesso e retornar status 201', async () => {
        const response = await request(app)
            .post('/users/register')
            .send(validUserPayload);
        expect(response.statusCode).toBe(201);
    });

    test('2. Deve retornar 400 por campos obrigatórios faltando (ZodError)', async () => {
        const invalidPayload = { ...validUserPayload, email: undefined };
        const response = await request(app)
            .post('/users/register')
            .send(invalidPayload);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Dados de entrada inválidos.');
    });

    test('3. Deve retornar 409 por email já existente', async () => {
        await UserRepository.create(validUserPayload);

        const response = await request(app)
            .post('/users/register')
            .send(validUserPayload);

        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe('O email fornecido já está em uso.');
    });

    test('4. Deve retornar 400 por email em formato inválido', async () => {
        const invalidPayload = { ...validUserPayload, email: 'email_invalido' };
        const response = await request(app)
            .post('/users/register')
            .send(invalidPayload);

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Dados de entrada inválidos.');
    });
});

describe('Rotas Autenticadas (/users/:id)', () => {
    describe('GET /users/:id', () => {

        test('5. Deve retornar status 200 e dados do usuário logado', async () => {
            const response = await request(app)
                .get(`/users/${authUserId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(200);
            expect(response.body).toBeDefined();
            expect(response.body.id).toBe(authUserId);
            expect(response.body.email).toBe(testUserAuthPayload.email);
            expect(response.body.password_hash).toBeUndefined();
        });

        test('6. Deve retornar 404 se o ID do usuário não for encontrado', async () => {
            const nonExistentId = '00000000-0000-0000-0000-000000000000';

            const response = await request(app)
                .get(`/users/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Usuário não encontrado.');
        });

        test('7. Deve retornar 401 se não enviar token de autenticação', async () => {
            const response = await request(app)
                .get(`/users/${authUserId}`);

            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Token de autenticação ausente.');
        });
    });

    describe('PUT /users/:id', () => {

        test('8. Deve atualizar o nome do usuário logado com sucesso (200)', async () => {
            const newName = 'Nome Atualizado Teste';

            const response = await request(app)
                .put(`/users/${authUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ nome: newName });

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Usuário atualizado com sucesso.');
            expect(response.body.user.nome).toBe(newName);

            const updatedUser = await UserRepository.findById(authUserId);
            expect(updatedUser.nome).toBe(newName);
        });

        test('9. Deve retornar 400 ao tentar atualizar com dados inválidos (Ex: email)', async () => {
            const response = await request(app)
                .put(`/users/${authUserId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ email: 'email_invalido' });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('Nenhum dado válido fornecido para atualização.');
        });
    });

    describe('DELETE /users/:id', () => {

        let userToDeleteId;
        const userToDeletePayload = {
            nome: 'User Deletavel',
            email: 'deletavel@escola.com',
            password: 'senhaSegura123',
            user_type: 'PROFESSOR',
            serie: '1º Ano',
        };

        beforeAll(async () => {
            const user = await UserRepository.create(userToDeletePayload);
            userToDeleteId = user.id;
        });

        test('10. Deve deletar o usuário com sucesso (204 No Content)', async () => {
            const response = await request(app)
                .delete(`/users/${userToDeleteId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(204);
            expect(response.body).toEqual({});

            const deletedUser = await UserRepository.findById(userToDeleteId);
            expect(deletedUser).toBeNull();
        });

        test('11. Deve retornar 404 se tentar deletar um usuário que não existe', async () => {
            const nonExistentId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

            const response = await request(app)
                .delete(`/users/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('ID de usuário inválido.');
        });
    });
});
