import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateResponse, runSuite } from '../src/gate.js';

test('passes status, latency, header, and nested JSON checks', () => {
  const result = evaluateResponse(
    {
      status: 200,
      durationMs: 120,
      headers: new Headers({ 'content-type': 'application/json; charset=utf-8' }),
      body: { user: { id: 42 } },
    },
    {
      expectStatus: 200,
      maxLatencyMs: 500,
      requireHeaders: { 'content-type': 'application/json' },
      requireJsonPaths: ['user.id'],
    },
  );
  assert.equal(result.passed, true);
  assert.equal(result.checks.length, 4);
});

test('fails with useful evidence when a latency budget is exceeded', () => {
  const result = evaluateResponse(
    { status: 200, durationMs: 800, headers: new Headers(), body: {} },
    { expectStatus: 200, maxLatencyMs: 300 },
  );
  assert.equal(result.passed, false);
  assert.match(result.checks.find((check) => check.name === 'latency').detail, /observed 800ms/);
});

test('runs a suite through an injected transport', async () => {
  const fakeFetch = async () => new Response(JSON.stringify({ id: 1 }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
  const result = await runSuite({ gates: [{
    name: 'user contract',
    url: 'https://example.invalid/user/1',
    expectStatus: 200,
    maxLatencyMs: 1000,
    requireJsonPaths: ['id'],
  }] }, fakeFetch);
  assert.equal(result.passed, true);
});
