# Workshop Monorepo

This repository contains a full-stack e-commerce demo using Medusa for the backend and a Next.js storefront for the frontend. It is organized as a monorepo for easy development and deployment.

## Structure

- `medusa-backend/` — Medusa backend service (TypeScript)
- `medusa-storefront/` — Next.js storefront (TypeScript, Tailwind CSS)
- `setup/` — Setup scripts and database dumps for local development

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- Yarn or npm
- PostgreSQL (for Medusa backend)

### Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/benjasl-stripe/workshop.git
   cd workshop
   ```

2. **Install dependencies:**
   ```sh
   cd medusa-backend && npm install
   cd ../medusa-storefront && npm install
   ```

3. **Database setup:**
   - See the `setup/` folder for database installation scripts and sample data.

4. **Run the backend:**
   ```sh
   cd medusa-backend
   npm run dev
   ```

5. **Run the storefront:**
   ```sh
   cd medusa-storefront
   npm run dev
   ```

## Features
- Medusa backend with custom modules and payment provider
- Next.js storefront with modern UI
- Stripe integration (frontend)
- Ready-to-use scripts for local development

## License
MIT
