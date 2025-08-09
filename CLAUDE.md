# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is json.cf - a latency-optimized JSON config service at the edge. The project is a Turborepo monorepo with:

### Core Architecture
- **Package**: `packages/json.cf/` - The main TypeScript SDK for interacting with json.cf API
- **API**: `apps/api/` - Cloudflare Worker API built with Hono framework  
- **Web**: `apps/web/` - Next.js web application for the frontend

### Key Components
- **SDK Core**: `packages/json.cf/src/core/index.ts` - Main JsonConfig class with `get()` and `getConfig()` methods
- **React Integration**: `packages/json.cf/src/frameworks/react/` - React hooks and state management using nanostores
- **API Routes**: `apps/api/src/modules/v1/` - RESTful API endpoints for config management

## Development Commands

### Root Level (uses Turborepo)
- `bun dev` - Start all development servers
- `bun build` - Build all packages and apps
- `bun lint` - Run linting across all workspaces
- `bun format` - Format code using Biome
- `bun format:fix` - Format and fix code issues
- `bun check-types` - Run TypeScript type checking
- `bun test:k6` - Run k6 performance tests

### SDK Package (`packages/json.cf/`)
- `bun build` - Build core SDK, React framework, and types
- `bun build:core` - Build only the core SDK (ESM, CJS, with types)
- `bun build:react` - Build only React framework integration
- `bun dev` - Watch mode for development

### API (`apps/api/`)
- `bun dev` - Start Cloudflare Worker in development mode via Wrangler
- `bun deploy` - Deploy to Cloudflare Workers (minified)
- `bun version` - Upload versioned deployment

### Web App (`apps/web/`)
- `bun dev` - Start Next.js development server with Turbopack
- `bun build` - Build production Next.js app
- `bun start` - Start production server
- `bun lint` - Run Next.js linting

## Code Style & Tooling

- **Package Manager**: Bun (specified in `packageManager` field)
- **Formatter**: Biome with 2-space indentation, single quotes, semicolons
- **Linting**: Biome with strict rules (no console.log, exhaustive deps disabled)
- **TypeScript**: Version 5.8.2 across all packages
- **Build Tool**: Native Bun build system for SDK, Wrangler for API

## API Design

The API follows OpenAPI specification using `@hono/zod-openapi` with Scalar documentation. Key patterns:
- RESTful endpoints: `/config/{id}` and `/config/{id}/kv/{key}`
- Optional authentication via `X-Config-Secret` header
- Consistent error handling with structured responses
- Sqids for URL-safe ID encoding

## SDK Architecture

- **Base Class**: JsonConfig with constructor accepting `id`, `secret`, and `baseUrl`
- **Methods**: `get(key)` for single values, `getConfig()` for all values
- **Framework Integrations**: React hooks with nanostores for state management
- **Build Targets**: Both ESM and CJS with full TypeScript declaration files