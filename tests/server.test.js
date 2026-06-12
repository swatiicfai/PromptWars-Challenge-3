/**
 * @jest-environment node
 */
const request = require('supertest');
const app = require('../server.js');

describe('Server Tests', () => {
  it('should respond with index.html on root route', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
  });

  it('should include security headers (Helmet)', async () => {
    const res = await request(app).get('/');
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['x-powered-by']).toBeUndefined(); // Helmet removes this by default
  });

  it('should include CORS headers', async () => {
    const res = await request(app).get('/');
    expect(res.headers['access-control-allow-origin']).toBe('https://named-deck-495705-v6-419483798137.us-central1.run.app');
  });

  it('should handle missing routes by serving index.html (SPA behavior)', async () => {
    const res = await request(app).get('/some-random-route');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
  });
});
