#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runSuite } from '../src/gate.js';

const configPath = process.argv[2];
if (!configPath) {
  console.error('Usage: api-quality-gate <config.json>');
  process.exit(2);
}

try {
  const config = JSON.parse(await readFile(resolve(configPath), 'utf8'));
  const suite = await runSuite(config);
  for (const result of suite.results) {
    console.log(`\n${result.passed ? 'PASS' : 'FAIL'} ${result.name}`);
    for (const check of result.checks) {
      console.log(`  ${check.passed ? '✓' : '✗'} ${check.name}: ${check.detail}`);
    }
  }
  console.log(`\nAPI quality gate: ${suite.passed ? 'PASSED' : 'FAILED'}`);
  process.exitCode = suite.passed ? 0 : 1;
} catch (error) {
  console.error(`Configuration error: ${error.message}`);
  process.exitCode = 2;
}
