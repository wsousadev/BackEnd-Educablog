import { EntitySchema } from 'typeorm';

export class UserEntity {
    id;
    nome;
    email;
    password_hash;
    user_type;
    serie;
    subject;
    created_at;
    updated_at;
    posts;
    edited_posts;
}

export const UserSchema = new EntitySchema({
    name: 'UserEntity',
    tableName: 'users',
    target: UserEntity,
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true,
        },
        nome: {
            type: String,
            length: 30,
            nullable: false,
        },
        email: {
            type: String,
            length: 100,
            unique: true,
            nullable: false,
        },
        password_hash: {
            type: 'varchar',
            length: 100,
            nullable: false,
        },
        user_type: {
            type: 'enum',
            enum: ['PROFESSOR', 'ALUNO'],
            default: 'ALUNO',
            nullable: false,
        },
        serie: {
            type: String,
            length: 30,
            nullable: true,
        },
        subject: {
            type: String,
            length: 30,
            nullable: true,
        },
        created_at: {
            type: 'timestamp',
            createDate: true,
            nullable: false,
        },
        updated_at: {
            type: 'timestamp',
            updateDate: true,
            nullable: false,
        },
    },
    relations: {
        posts: {
            type: 'one-to-many',
            target: 'PostEntity',
            inverseSide: 'created_by',
        },
        edited_posts: {
            type: 'one-to-many',
            target: 'PostEntity',
            inverseSide: 'edited_by',
        },
    },
});
