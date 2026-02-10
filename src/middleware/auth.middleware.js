import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import UserRepository from '../models/user.model.js';

const SECRET = process.env.JWT_SECRET || 'segredo-super-secreto';

/**
 * @description Middleware para validar a presença e a validade de um Token JWT.
 * @description Ele anexa o objeto 'user' (sem o hash da senha) ao objeto 'req'.
 * @type {import('express').RequestHandler}
 */

export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return next(createError(401, 'Token de autenticação ausente.'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return next(createError(401, 'Formato do token inválido (Esperado: Bearer <token>).'));
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        const user = await UserRepository.findById(decoded.id);

        if (!user) {
            return next(createError(401, 'Usuário associado ao token não encontrado.'));
        }

        const { /*password_hash, */...userPublic } = user;
        req.user = userPublic;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(createError(401, 'Token expirado.'));
        }
        if (error.name === 'JsonWebTokenError') {
            return next(createError(401, 'Token inválido.'));
        }
        console.error('Erro no middleware de autenticação:', error.message);
        return next(createError(500, 'Falha interna na autenticação.'));
    }
};

/**
 * @description Middleware para autorizar acesso baseado no tipo de usuário.
 * @description Exemplo de uso: checkRole('PROFESSOR')
 * @param {('PROFESSOR'|'ALUNO')[]} allowedRoles
 * @returns {import('express').RequestHandler}
 */
export const checkRole = (allowedRoles) => (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.user_type)) {
        return next(createError(403, 'Acesso negado. Você não tem permissão para esta ação.'));
    }
    next();
};