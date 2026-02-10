import PostRepository, { PostCreationSchema, PostUpdateSchema } from '../models/post.model.js';
import createError from 'http-errors';

/**
 * @typedef {import('express').RequestHandler} RequestHandler
 */

const formatZodErrors = (error) => {
    return error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
    }));
};

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Cria um novo post
 *     tags: [Posts]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título do post
 *                 example: Meu primeiro post
 *               content:
 *                 type: string
 *                 description: Conteúdo do post
 *                 example: Este é o conteúdo do post
 *     responses:
 *       201:
 *         description: Post criado com sucesso.
 *       400:
 *         description: Dados de entrada inválidos.
 *       500:
 *         description: Falha interna ao criar o post.
 */
/**
 * @description Lida com a criação de um novo post. (POST /posts)
 * @type {RequestHandler}
 */
export const createPost = async (req, res, next) => {
    try {
        const created_by_id = req.user.id;
        const postData = PostCreationSchema.parse({ ...req.body, created_by_id });
        const newPost = await PostRepository.create(postData);

        res.status(201).json({
            message: 'Post criado com sucesso!',
            post: newPost,
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            return next(createError(400, 'Dados de entrada inválidos.', { details: formatZodErrors(error) }));
        }

        console.error("Erro ao criar post:", error.message);
        next(createError(500, 'Falha interna ao criar o post.'));
    }
};

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Lista todos os posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Lista de posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *       500:
 *         description: Falha interna ao buscar posts.
 */
/**
 * @description Lida com a listagem de todos os posts. (GET /posts)
 * @type {RequestHandler}
 */
export const getAllPosts = async (req, res, next) => {
    try {
        const posts = await PostRepository.findAll();
        res.json(posts);
    } catch (error) {
        console.error("Erro ao listar posts:", error.message);
        next(createError(500, 'Falha interna ao buscar posts.'));
    }
};

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Busca um post pelo ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do post
 *     responses:
 *       200:
 *         description: Post encontrado.
 *       400:
 *         description: ID de post inválido.
 *       404:
 *         description: Post não encontrado.
 *       500:
 *         description: Falha interna ao buscar o post.
 */
/**
 * @description Lida com a busca de um post pelo ID. (GET /posts/:id)
 * @type {RequestHandler}
 */
export const getPostById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return next(createError(400, 'ID de post inválido.'));

        const post = await PostRepository.findById(id);

        if (!post) {
            return next(createError(404, 'Post não encontrado.'));
        }

        res.json(post);
    } catch (error) {
        console.error("Erro ao buscar post por ID:", error.message);
        next(createError(500, 'Falha interna ao buscar o post.'));
    }
};

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Atualiza um post pelo ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do post
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Título Updated do post
 *                 example: Meu primeiro post Updated
 *               content:
 *                 type: string
 *                 description: Conteúdo Updated do post
 *                 example: Este é o conteúdo Updated do post
 *     responses:
 *       200:
 *         description: Post atualizado com sucesso
 *       400:
 *         description: ID de post inválido.
 *       404:
 *         description: Post não encontrado para atualização.
 *       500:
 *         description: Falha interna ao atualizar o post.
 */
/**
 * @description Lida com a atualização de um post pelo ID. (PUT /posts/:id)
 * @type {RequestHandler}
 */
export const updatePost = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) return next(createError(400, 'ID de post inválido.'));

        const edited_by_id = req.user.id;
        const validatedUpdateData = PostUpdateSchema.parse(req.body);
        const updateData = { ...validatedUpdateData, edited_by_id };
        const updatedPost = await PostRepository.update(id, updateData);

        if (!updatedPost) {
            return next(createError(404, 'Post não encontrado para atualização.'));
        }

        res.json({ message: 'Post atualizado com sucesso.', post: updatedPost });

    } catch (error) {
        if (error.name === 'ZodError') {
            return next(createError(400, 'Dados de entrada inválidos.', { details: formatZodErrors(error) }));
        }

        console.error("Erro ao atualizar post:", error.message);
        next(createError(500, 'Falha interna ao atualizar o post.'));
    }
};

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Remove um post pelo ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do post
 *     responses:
 *       204:
 *         description: Post removido com sucesso.
 *       400:
 *         description: ID de post inválido.
 *       404:
 *         description: Post não encontrado para exclusão.
 *       500:
 *         description: Falha interna ao deletar o post.
 */
/**
 * @description Lida com a remoção de um post pelo ID. (DELETE /posts/:id)
 * @type {RequestHandler}
 */
export const deletePost = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return next(createError(400, 'ID de post inválido.'));

        const wasRemoved = await PostRepository.remove(id);

        if (!wasRemoved) {
            return next(createError(404, 'Post não encontrado para exclusão.'));
        }

        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar post:", error.message);
        next(createError(500, 'Falha interna ao deletar o post.'));
    }
};

/**
 * @swagger
 * /posts/search:
 *   get:
 *     summary: Busca posts por palavra-chave
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: termo
 *         required: true
 *         schema:
 *           type: string
 *         description: Palavra-chave para busca
 *     responses:
 *       200:
 *         description: Resultados da busca
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *       400:
 *         description: Parâmetro de busca ausente ou inválido
 *       500:
 *         description: Erro interno no servidor
 */
/**
 * @description Lida com a busca de posts por palavra-chave. (GET /posts/search?termo=...)
 * @type {RequestHandler}
 */
export const searchPosts = async (req, res, next) => {
    try {
        const termo = req.query.termo;

        if (!termo || typeof termo !== 'string' || termo.trim() === '') {
            return next(createError(400, 'O parâmetro de busca "termo" é obrigatório.'));
        }

        const resultados = await PostRepository.search(termo);

        res.json(resultados);
    } catch (error) {
        console.error("Erro ao buscar posts:", error.message);
        next(createError(500, 'Falha interna ao buscar posts.'));
    }
};

export default {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
};