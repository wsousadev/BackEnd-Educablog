import { z } from 'zod';

import { AppDataSource } from '../lib/pg/db.init.js';
import { PostEntity } from '../entities/post.entity.js';
import { Like } from 'typeorm';

/**
 * @description Schema para criação de um novo post (POST /posts).
 * @description O 'created_by_id' será injetado pelo controller via 'req.user.id'.
 */
export const PostCreationSchema = z.object({
    title: z.string().min(1, 'O título é obrigatório.').max(100, 'O título deve ter no máximo 100 caracteres.'),
    content: z.string().min(1, 'O conteúdo é obrigatório.'),
    created_by_id: z.number().int().positive('O ID do autor deve ser um número inteiro positivo.'),
});

/**
 * @description Schema para atualização de um post existente (PUT /posts/:id).
 * @description O 'edited_by_id' será injetado pelo controller via 'req.user.id'.
 */
export const PostUpdateSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    content: z.string().min(1).optional(),
    edited_by_id: z.number().int().positive().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "Nenhum dado válido fornecido para atualização."
});

class PostRepository {
    get repository() {
        if (!AppDataSource || !AppDataSource.isInitialized) {
            console.error('ERRO: AppDataSource não inicializado! Execute initializeDatabase() primeiro.');
            throw new Error('Database connection not initialized.');
        }
        return AppDataSource.getRepository(PostEntity);
    }

    /**
     * @description Cria um novo post.
     * @param {z.infer<typeof PostCreationSchema>} postData
     */
    async create(postData) {
        const post = this.repository.create(postData);
        return this.repository.save(post);
    }

    /**
     * @description Busca todos os posts (inclui dados do autor).
     */
    async findAll() {
        return this.repository.find({
            relations: ['created_by'],
            order: { created_at: 'DESC' }
        });
    }

    /**
     * @description Busca um post pelo ID (inclui dados do autor).
     * @param {number} id
     */
    async findById(id) {
        return this.repository.findOne({
            where: { id },
            relations: ['created_by']
        });
    }

    /**
     * @description Atualiza dados de um post.
     * @param {number} id
     * @param {object} updateData - Dados a serem atualizados (inclui edited_by_id).
     */
    async update(id, updateData) {
        const post = await this.repository.findOne({ where: { id } });

        if (!post) return null;

        this.repository.merge(post, updateData);
        return this.repository.save(post);
    }

    /**
     * @description Remove um post pelo ID.
     * @param {number} id
     */
    async remove(id) {
        const result = await this.repository.delete(id);
        return result.affected > 0;
    }

    /**
     * @description Busca posts por uma palavra-chave no título ou conteúdo.
     * @param {string} termo - Palavra-chave para busca.
     */
    async search(termo) {
        return this.repository.find({
            where: [
                { title: Like(`%${termo}%`) },
                { content: Like(`%${termo}%`) }
            ],
            relations: ['created_by'],
            order: { created_at: 'DESC' }
        });
    }
}

export default new PostRepository();