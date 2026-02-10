import request from 'supertest';
import { describe, test, expect } from 'vitest';

import app from '../app.js';

describe('GET /', () => {
	test('Deve responder com status 200', async () => {
		const response = await request(app).get('/');
		expect(response.statusCode).toBe(200);
	});
});
