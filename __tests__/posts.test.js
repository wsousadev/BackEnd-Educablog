import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

import app from '../app.js';
import UserRepository from '../src/models/user.model.js';
import PostRepository from '../src/models/post.model.js';

let authToken;
let authUserId;

const testUserAuthPayload = {
    nome: 'Post Author',
    email: 'post.author@escola.com',
    password: 'postPassword123',
    user_type: 'PROFESSOR',
    serie: '9º Ano',
};

const basePostPayload = {
    title: 'Título de Teste do Post',
    content: 'Conteúdo do post de teste.',
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
}, 30000);

afterAll(async () => {
    if (authUserId) {
        await UserRepository.remove(authUserId);
    }
});

describe('Rotas de Leitura de Posts (GET /posts)', () => {
    let postId;

    beforeAll(async () => {
        const post = await PostRepository.create({
            ...basePostPayload,
            created_by_id: authUserId,
        });
        postId = post.id;
    });

    afterAll(async () => {
        if (postId) {
            await PostRepository.remove(postId);
        }
    });

    test('1. GET /posts - Deve retornar status 200 e uma lista de posts', async () => {
        const response = await request(app)
            .get('/posts');

        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    test('2. GET /posts/:id - Deve retornar status 200 e o post específico', async () => {
        const response = await request(app)
            .get(`/posts/${postId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('id', postId);
    });

    test('3. GET /posts/:id - Deve retornar 404 se o post não existir', async () => {
        const nonExistentId = '00000000-0000-0000-0000-000000000000';

        const response = await request(app)
            .get(`/posts/${nonExistentId}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Post não encontrado.');
    });
});

describe('Rotas de Manipulação de Posts (POST, PUT, DELETE)', () => {

    let createdPostId;

    afterEach(async () => {
        if (createdPostId) {
            await PostRepository.remove(createdPostId);
            createdPostId = null;
        }
    });

    describe('POST /posts', () => {

        test('4. Deve criar um novo post com sucesso e retornar 201', async () => {
            const response = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send(basePostPayload);
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('post');
            expect(response.body.post).toHaveProperty('id');
            expect(response.body.post.title).toBe(basePostPayload.title);

            createdPostId = response.body.post.id;
        });

        test('5. Deve retornar 400 se o payload for inválido (faltando title)', async () => {
            const response = await request(app)
                .post('/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Conteúdo sem título' });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('Dados de entrada inválidos.');
        });

        test('6. Deve retornar 401 se tentar criar post sem autenticação', async () => {
            const response = await request(app)
                .post('/posts')
                .send(basePostPayload);

            expect(response.statusCode).toBe(401);
            expect(response.body.message).toBe('Token de autenticação ausente.');
        });
    });

    describe('PUT /posts/:id', () => {
        let postIdToUpdate;

        beforeEach(async () => {
            const post = await PostRepository.create({
                ...basePostPayload,
                created_by_id: authUserId,
            });
            postIdToUpdate = post.id;
        });

        afterEach(async () => {
            if (postIdToUpdate) {
                await PostRepository.remove(postIdToUpdate);
            }
        });

        test('7. Deve atualizar o título do post com sucesso e retornar 200', async () => {
            const newTitle = 'Título Atualizado Teste';

            const response = await request(app)
                .put(`/posts/${postIdToUpdate}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: newTitle });

            expect(response.statusCode).toBe(200);
            expect(response.body.post).toBeDefined();
            expect(response.body.post.title).toBe(newTitle);
        });

        test('8. Deve retornar 404 se tentar atualizar um post que não existe', async () => {
            const nonExistentId = '00000000-0000-0000-0000-000000000000';

            const response = await request(app)
                .put(`/posts/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ title: 'Novo Título' });

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Post não encontrado para atualização.');
        });
    });

    describe('DELETE /posts/:id', () => {
        let postIdToDelete;

        beforeEach(async () => {
            const post = await PostRepository.create({
                ...basePostPayload,
                created_by_id: authUserId,
            });
            postIdToDelete = post.id;
        });

        test('9. Deve deletar o post com sucesso e retornar 204 No Content', async () => {
            const response = await request(app)
                .delete(`/posts/${postIdToDelete}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(204);
            expect(response.body).toEqual({});

            const deletedPost = await PostRepository.findById(postIdToDelete);
            expect(deletedPost).toBeNull();
        });

        test('10. Deve retornar 404 se tentar deletar um post que não existe', async () => {
            const nonExistentId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

            const response = await request(app)
                .delete(`/posts/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('ID de post inválido.');
        });
    });
});
