import { z } from 'zod';
import bcrypt from 'bcryptjs';

import { AppDataSource } from '../lib/pg/db.init.js';
import { UserEntity } from '../entities/user.entity.js';

export const UserCreationSchema = z.object({
    nome: z.string().min(1).max(30),
    email: z.string().email().max(100),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    user_type: z.enum(['PROFESSOR', 'ALUNO']),
    serie: z.string().max(30).optional().nullable(),
    subject: z.string().max(30).optional().nullable(),
});

class UserRepository {
    get repository() {
        if (!AppDataSource || !AppDataSource.isInitialized) {
            console.error('ERRO: AppDataSource não inicializado! Execute initializeDatabase() primeiro.');
            throw new Error('Database connection not initialized.');
        }
        return AppDataSource.getRepository(UserEntity);
    }

    /**
     * Cria e retorna o hash de uma senha.
     * @param {string} password - Senha em texto claro.
     * @returns {Promise<string>} O hash bcryptjs da senha.
     */
    async hashPassword(password) {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }

    /**
     * Compara a senha em texto claro com o hash.
     * @param {string} password - Senha em texto claro.
     * @param {string} hash - Hash armazenado no DB.
     * @returns {Promise<boolean>}
     */
    async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    /**
     * @description Cria um novo usuário (usado no registro).
     * @param {z.infer<typeof UserCreationSchema>} userData
     */
    async create(userData) {
        const password_hash = await this.hashPassword(userData?.password);
        const { /*password, */...dataToSave } = userData;

        const user = this.repository.create({
            ...dataToSave,
            password_hash: password_hash
        });

        return this.repository.save(user);
    }

    async findById(id) {
        return this.repository.findOne({ where: { id } });
    }

    async findByEmail(email) {
        return this.repository.findOne({ where: { email } });
    }

    async findAll() {
        return this.repository.find();
    }

    /**
     * Atualiza dados do usuário.
     * @param {number} id
     * @param {object} updateData - Dados a serem atualizados (pode incluir 'password').
     */
    async update(id, updateData) {
        if (updateData.password) {
            updateData.password_hash = await this.hashPassword(updateData.password);
            delete updateData.password;
        }

        const user = await this.repository.findOne({ where: { id } });
        if (!user) return null;

        this.repository.merge(user, updateData);
        return this.repository.save(user);
    }

    async remove(id) {
        const result = await this.repository.delete(id);
        return result.affected > 0;
    }
}

export default new UserRepository();
