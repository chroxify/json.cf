<h1 align="center">JSON.CF</h1>

<p align="center">
  <a aria-label="NPM version" href="https://www.npmjs.com/package/json.cf">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/json.cf?color=%23008000">
  </a>
  <a aria-label="Package size" href="https://bundlephobia.com/result?p=json.cf">
    <img alt="" src="https://badgen.net/bundlephobia/minzip/json.cf">
  </a>
  <a aria-label="License" href="https://github.com/chroxify/json.cf/blob/main/LICENSE">
    <img alt="GitHub License" src="https://img.shields.io/github/license/chroxify/json.cf?color=%23008000">
  </a>
</p>

## Introduction

json.cf is a dead simple, latency-optimized JSON config service at the edge. Perfect for feature flags, remote configuration, and dynamic settings that need to be accessible with minimal latency worldwide.

## Features

- **Edge Optimized** - Deployed on Cloudflare Workers for sub-50ms global latency
- **Private Configs** - Secure configurations with secret-based authentication
- **Framework Agnostic** - Works with any JavaScript framework or vanilla JS
- **React Integration** - Built-in React hooks with automatic state management
- **Real-time Updates** - Instantly update configs without deployments
- **REST API** - Simple HTTP API for any language or platform

## Quick Start

### Package

```ts
import { jsonConfig } from "json.cf";

// Create a config instance
const config = jsonConfig({
  id: "your-config-id",
  secret: "your-secret", // Optional, for private configs
});

// Get a specific value
const featureFlag = await config.get("featureEnabled");

// Get entire config
const allConfig = await config.getConfig();
```

### React Integration

```tsx
import { useJsonConfig } from "json.cf/react";

function MyComponent() {
  const { data, loading, error } = useJsonConfig({
    id: "your-config-id",
    secret: "your-secret", // Optional
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>Feature enabled: {data?.featureEnabled}</div>;
}
```

### REST API

```bash
# Get entire config
curl -X GET "https://api.json.cf/v1/config/your-config-id"

# Get config with secret (for private configs)
curl -X GET "https://api.json.cf/v1/config/your-config-id" \
  -H "X-Config-Secret: your-secret"

# Create new config
curl -X POST "https://api.json.cf/v1/config" \
  -H "Content-Type: application/json" \
  -d '{"featureEnabled": true, "theme": "dark"}'

# Update existing config
curl -X PUT "https://api.json.cf/v1/config/your-config-id" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-secret" \
  -d '{"featureEnabled": false, "theme": "light"}'
```

[View API Documentation →](https://json.cf/docs)

### Web Interface

Manage your configs visually at [json.cf](https://json.cf).

## Use Cases

- **Feature Flags** - Toggle features on/off without deployments
- **A/B Testing** - Dynamic configuration for experiments
- **Theme Settings** - Remote theme and styling configurations
- **API Keys** - Securely store and rotate API keys
- **Environment Variables** - Dynamic environment-specific settings
- **Content Management** - Update copy, messages, and content remotely

## Installation

```bash
npm install json.cf
# or
yarn add json.cf
# or
pnpm add json.cf
# or
bun add json.cf
```

## API Reference

### Core Functions

#### `jsonConfig(options)`

Creates a new config instance.

```ts
interface ConfigOptions {
  id: string; // Config ID
  secret?: string; // Secret for private configs
  baseUrl?: string; // Custom API base URL
}
```

#### `config.get(key)`

Get a specific value from the config.

```ts
const value = await config.get("myKey");
```

#### `config.getConfig()`

Get the entire configuration object.

```ts
const fullConfig = await config.getConfig();
```

### React Hooks

#### `useJsonConfig(options)`

React hook for accessing config with automatic state management.

```ts
const { data, loading, error, refetch } = useJsonConfig({
  id: "config-id",
  secret: "optional-secret",
});
```

## License

MIT License.
