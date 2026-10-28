const getPath = (value, path) => path.split('.').reduce((current, key) => current?.[key], value);

export function evaluateResponse({ status, durationMs, headers, body }, rules) {
  const checks = [];
  const record = (name, passed, detail) => checks.push({ name, passed, detail });

  record('status', status === rules.expectStatus, `expected ${rules.expectStatus}, received ${status}`);
  record(
    'latency',
    durationMs <= rules.maxLatencyMs,
    `budget ${rules.maxLatencyMs}ms, observed ${durationMs}ms`,
  );

  for (const [name, expected] of Object.entries(rules.requireHeaders ?? {})) {
    const actual = headers.get(name);
    record(`header:${name}`, actual?.toLowerCase().includes(expected.toLowerCase()) ?? false, `expected ${expected}, received ${actual}`);
  }

  for (const path of rules.requireJsonPaths ?? []) {
    const actual = getPath(body, path);
    record(`json:${path}`, actual !== undefined && actual !== null, `received ${JSON.stringify(actual)}`);
  }

  return { passed: checks.every((check) => check.passed), checks };
}

export async function runGate(gate, fetchImpl = fetch) {
  const startedAt = performance.now();
  try {
    const response = await fetchImpl(gate.url, {
      method: gate.method ?? 'GET',
      headers: gate.headers,
      signal: AbortSignal.timeout(gate.timeoutMs ?? 10_000),
    });
    const durationMs = Math.round(performance.now() - startedAt);
    const contentType = response.headers.get('content-type') ?? '';
    const body = contentType.includes('json') ? await response.json() : await response.text();
    return {
      name: gate.name,
      ...evaluateResponse(
        { status: response.status, durationMs, headers: response.headers, body },
        gate,
      ),
    };
  } catch (error) {
    return {
      name: gate.name,
      passed: false,
      checks: [{ name: 'request', passed: false, detail: error.message }],
    };
  }
}

export async function runSuite(config, fetchImpl = fetch) {
  if (!Array.isArray(config.gates) || config.gates.length === 0) {
    throw new Error('Configuration must contain at least one gate.');
  }
  const results = [];
  for (const gate of config.gates) results.push(await runGate(gate, fetchImpl));
  return { passed: results.every((result) => result.passed), results };
}
