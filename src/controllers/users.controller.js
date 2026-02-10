import UserRepository, { UserCreationSchema } from '../models/user.model.js';
import createError from 'http-errors';

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do usuário
 *                 example: Exemplo de Usuário
 *               email:
 *                 type: string
 *                 description: Email do usuário
 *                 example: usuario.exemplo@email.com
 *               user_type:
 *                 type: string
 *                 description: Tipo do usuário ( ALUNO | PROFESSOR )
 *                 example: ALUNO
 *               password:
 *                 type: string
 *                 description: Senha do usuário ( deve conter ao menos 6 caracteres )
 *                 example: senha123
 *               serie:
 *                 type: string
 *                 description: Série do usuário ( Opcional)
 *                 example: 5ª série
 *               subject:
 *                 type: string
 *                 description: Matéria do usuário ( Opcional )
 *                 example: Matemática
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       409:
 *         description: Dados de entrada inválidos.
 *       500:
 *         description: Falha interna ao registrar o usuário.
 */
/**
 * @typedef {import('express').RequestHandler} RequestHandler
 */

/**
 * @description Lida com o registro (Criação) de um novo usuário. (POST /users/register)
 * @type {RequestHandler}
 */
export const registerUser = async (req, res, next) => {
    try {
        const userData = UserCreationSchema.parse(req.body);

        const existingUser = await UserRepository.findByEmail(userData.email);
        if (existingUser) {
            return next(createError(409, 'O email fornecido já está em uso.'));
        }

        const newUser = await UserRepository.create(userData);
        const userResponse = {
            id: newUser.id,
            nome: newUser.nome,
            email: newUser.email,
            user_type: newUser.user_type,
            serie: newUser.serie,
            subject: newUser.subject
        };

        res.status(201).json({
            message: 'Usuário registrado com sucesso!',
            user: userResponse,
        });
    } catch (error) {
        if (error.name === 'ZodError') {
            const formattedErrors = error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
            }));
            return next(createError(400, 'Dados de entrada inválidos.', { details: formattedErrors }));
        }

        console.error("Erro no registro do usuário:", error.message);
        next(createError(500, 'Falha interna ao registrar o usuário.'));
    }
};


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nome:
 *                     type: string
 *                   email:
 *                     type: string
 *                   user_type:
 *                     type: string
 *                   serie:
 *                     type: string
 *                   subject:
 *                     type: string
 *       401:
 *         description: Token de autenticação ausente.
 *       403:
 *         description: Token inválido.
 *       500:
 *         description: Falha interna ao listar usuários.
 */
/**
 * @description Lida com a listagem de todos os usuários. (GET /users)
 * @type {RequestHandler}
 */
export const listAllUsers = async (req, res, next) => {
    try {
        const users = await UserRepository.findAll();
        const usersResponse = users.map(user => {
            // eslint-disable-next-line
            const { password_hash, ...userPublic } = user;
            return userPublic;
        });
        res.json(usersResponse);
    } catch (error) {
        console.error("Erro ao listar usuários:", error.message);
        next(createError(500, 'Falha interna ao listar usuários.'));
    }
};

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Busca um usuário pelo ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado.
 *       400:
 *         description: ID de usuário inválido.
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Falha interna ao buscar usuário.
 */
/**
 * @description Lida com a busca de um usuário pelo ID. (GET /users/:id)
 * @type {RequestHandler}
 */
export const getUserById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return next(createError(400, 'ID de usuário inválido.'));

        const user = await UserRepository.findById(id);

        if (!user) {
            return next(createError(404, 'Usuário não encontrado.'));
        }

        // eslint-disable-next-line
        const { password_hash, ...userResponse } = user;
        res.json(userResponse);
    } catch (error) {
        console.error("Erro ao buscar usuário por ID:", error.message);
        next(createError(500, 'Falha interna ao buscar usuário.'));
    }
};


/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza um usuário pelo ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do usuário Updated
 *                 example: Exemplo de Usuário Updated
 *               email:
 *                 type: string
 *                 description: Email do usuário
 *                 example: usuario.exemplo.updated@email.com
 *               user_type:
 *                 type: string
 *                 description: Tipo do usuário ( ALUNO | PROFESSOR )
 *                 example: PROFESSOR
 *               password:
 *                 type: string
 *                 description: Senha do usuário ( deve conter ao menos 6 caracteres )
 *                 example: senha1234
 *               serie:
 *                 type: string
 *                 description: Série do usuário ( Opcional)
 *                 example: 6ª série
 *               subject:
 *                 type: string
 *                 description: Matéria do usuário ( Opcional )
 *                 example: Português
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *       400:
 *         description: ID de usuário inválido.
 *       404:
 *         description: Nenhum dado válido fornecido para atualização.
 *       500:
 *         description: Erro interno no servidor
 */
/**
 * @description Lida com a atualização de um usuário pelo ID. (PUT /users/:id)
 * @description Implementação simplificada: requer validação Zod adicional para updates se necessário.
 * @type {RequestHandler}
 */
export const updateUser = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return next(createError(400, 'ID de usuário inválido.'));

        const { nome, user_type, serie, subject } = req.body;
        const updateData = { nome, user_type, serie, subject };

        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        if (Object.keys(updateData).length === 0) {
            return next(createError(400, 'Nenhum dado válido fornecido para atualização.'));
        }

        const updatedUser = await UserRepository.update(id, updateData);

        if (!updatedUser) {
            return next(createError(404, 'Usuário não encontrado para atualização.'));
        }

        // eslint-disable-next-line
        const { password_hash, ...userResponse } = updatedUser;
        res.json({ message: 'Usuário atualizado com sucesso.', user: userResponse });

    } catch (error) {
        console.error("Erro ao atualizar usuário:", error.message);
        next(createError(500, 'Falha interna ao atualizar usuário.'));
    }
};

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Remove um usuário pelo ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       204:
 *         description: Usuário removido com sucesso.
 *       400:
 *         description: ID de usuário inválido.
 *       404:
 *         description: Usuário não encontrado para exclusão.
 *       500:
 *         description: Falha interna ao deletar usuário.
 */
/**
 * @description Lida com a remoção de um usuário pelo ID. (DELETE /users/:id)
 * @type {RequestHandler}
 */
export const deleteUser = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return next(createError(400, 'ID de usuário inválido.'));

        const wasRemoved = await UserRepository.remove(id);

        if (!wasRemoved) {
            return next(createError(404, 'Usuário não encontrado para exclusão.'));
        }

        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar usuário:", error.message);
        next(createError(500, 'Falha interna ao deletar usuário.'));
    }
};
