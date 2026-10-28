<div align="center">

# API Quality Gates

**A dependency-free Node.js CLI that turns API expectations into an explainable CI release gate.**

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![API gate](https://github.com/foysal619/api-quality-gates/actions/workflows/api-gate.yml/badge.svg)](https://github.com/foysal619/api-quality-gates/actions/workflows/api-gate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-14B8A6.svg)](LICENSE)

</div>

## Why this project

Many API checks are either trapped in a GUI collection or hidden inside a large test framework. This small CLI keeps the deployment contract visible: expected status, latency budget, content type, and required JSON paths live in one readable JSON file. A failed gate reports exactly which expectation broke and exits non-zero for CI.

## Capabilities

- HTTP method, timeout, and header configuration
- Exact status-code checks
- Per-endpoint latency budgets
- Required response-header values
- Required nested JSON paths
- Deterministic offline unit tests through injected transport
- Zero runtime dependencies on Node.js 20+
- Clear exit codes: `0` pass, `1` quality failure, `2` configuration error

## Quick start

```bash
git clone https://github.com/foysal619/api-quality-gates.git
cd api-quality-gates
npm test
npm run check
```

Run a custom contract:

```bash
node bin/api-quality-gate.js path/to/your.gates.json
```

## Configuration

```json
{
  "gates": [
    {
      "name": "Customer profile contract",
      "url": "https://api.example.com/customers/42",
      "method": "GET",
      "expectStatus": 200,
      "maxLatencyMs": 500,
      "timeoutMs": 5000,
      "requireHeaders": { "content-type": "application/json" },
      "requireJsonPaths": ["id", "profile.name", "profile.status"]
    }
  ]
}
```

Keep authentication values in environment-backed CI secrets. This example intentionally contains no credential support that could encourage committed tokens; extend the loader to resolve your platform’s secret references at runtime.

## Example output

```text
PASS Customer profile contract
  ✓ status: expected 200, received 200
  ✓ latency: budget 500ms, observed 184ms
  ✓ header:content-type: expected application/json, received application/json
  ✓ json:profile.status: received "ACTIVE"

API quality gate: PASSED
```

## Where it fits

Use this as a fast deployment check for a small set of business-critical contracts. Keep deep functional, schema-evolution, security, and performance coverage in purpose-built suites. A good gate is small, stable, fast, and directly connected to release risk.

## Roadmap

- JSON Schema and OpenAPI fragment validation
- Environment-variable interpolation
- JUnit and GitHub Step Summary reporters
- Baseline-based latency regression detection

## Author

Built by [Musfiqur Rahman Foysal](https://github.com/foysal619), Software QA Engineer focused on practical quality signals and delivery confidence.
