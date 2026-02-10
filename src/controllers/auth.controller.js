import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import UserRepository from '../models/user.model.js';

const SECRET = process.env.JWT_SECRET || 'segredo-super-secreto';

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza o login de um usuário.
 *     description: Autentica um usuário com email e senha, retornando um token JWT.
 *     tags:
 *       - Autenticação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: O email do usuário.
 *                 example: usuario.exemplo@email.com
 *               password:
 *                 type: string
 *                 description: A senha do usuário.
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT gerado para autenticação.
 *                 user_type:
 *                   type: string
 *                   description: Tipo do usuário.
 *                 id:
 *                   type: integer
 *                   description: ID do usuário.
 *                 nome:
 *                   type: string
 *                   description: Nome do usuário.
 *       400:
 *         description: Requisição inválida (email ou senha ausentes).
 *       401:
 *         description: Credenciais inválidas.
 *       500:
 *         description: Erro interno no servidor.
 */

/**
 * @typedef {import('express').RequestHandler} RequestHandler
 */

/**
 * Lida com a autenticação (Login) de um usuário.
 * POST /auth/login
 * @type {RequestHandler}
 */
export const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(createError(400, 'Email e senha são obrigatórios.'));
    }

    try {
        const user = await UserRepository.findByEmail(email);

        if (!user) {
            return next(createError(401, 'Credenciais inválidas.'));
        }

        const isPasswordValid = await UserRepository.comparePassword(password, user.password_hash);

        if (!isPasswordValid) {
            return next(createError(401, 'Credenciais inválidas.'));
        }

        const token = jwt.sign(
            { id: user.id, user_type: user.user_type, email: user.email },
            SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user_type: user.user_type,
            id: user.id,
            nome: user.nome
        });

    } catch (error) {
        console.error('Erro no login do usuário:', error.message);
        next(createError(500, 'Falha interna ao realizar o login.'));
    }
};
