import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        hookTimeout: 30000,
        testTimeout: 60000,
        setupFiles: ['./vitest.setup.js'],
        singleThread: true,
        deps: {
            inline: ['supertest']
        }
    },
});
