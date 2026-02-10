import { EntitySchema } from 'typeorm';
// eslint-disable-next-line
import { UserEntity } from './user.entity.js';

export class PostEntity {
    id;
    title;
    content;
    created_by_id;
    edited_by_id;
    created_at;
    edited_at;
    created_by;
    edited_by;
}

export const PostSchema = new EntitySchema({
    name: 'PostEntity',
    tableName: 'posts',
    target: PostEntity,
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true,
        },
        title: {
            type: String,
            length: 100,
            nullable: false,
        },
        content: {
            type: 'text',
            nullable: false,
        },
        created_by_id: {
            type: Number,
            nullable: false,
        },
        edited_by_id: {
            type: Number,
            nullable: true,
        },
        created_at: {
            type: 'timestamp',
            createDate: true,
            nullable: false,
        },
        edited_at: {
            type: 'timestamp',
            updateDate: true,
            nullable: true,
        },
    },
    relations: {
        created_by: {
            type: 'many-to-one',
            target: 'UserEntity',
            joinColumn: {
                name: 'created_by_id',
            },
            nullable: false,
            onDelete: 'CASCADE',
            inverseSide: 'posts'
        },
        edited_by: {
            type: 'many-to-one',
            target: 'UserEntity',
            joinColumn: {
                name: 'edited_by_id',
            },
            nullable: true,
            onDelete: 'SET NULL',
            inverseSide: 'edited_posts'
        },
    },
});
