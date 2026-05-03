# DoorStop — Door Company Interface

An internal management dashboard for a door company, built with React, TypeScript, and a .NET backend

This repository is an early-stage business tool for managing jobs, quotes, customers, and product inventory.

## What it is

Internal dashboard supporting:

- **Jobs** — create, edit, and track installation jobs
- **Quotes** — manage customer quotes through their lifecycle
- **Customers** — customer records and contact info
- **Inventory** — doors, cavity sliders, and hardware catalogues
- **Status badges** — `good | processing | warn | error` across all views

## Architecture

```
PageWrapper        — consistent page header with title and action button
Table              — generic tabular component, accepts headers + rows
Status             — coloured badge component for record states
Layout             — shell with sidebar navigation
```

## Project structure

```
src/
  root/               app entry, layout, routes
  pages/
    main-pages/       jobs, quotes, customers, invoices, orders
    side-pages/       doors, cavity sliders, hardware, door/hinge/handle types
  components/         table, status, page-wrapper, modal, form-wrapper, button
  api/                axios client (points to .NET backend)
```

Each feature follows a three-file convention: `index.tsx` · `model.ts` · `styles.scss`
Each feature page with data has an `api.ts` for its backend calls.

## Commands

```bash
npm run setup   # configure API URL and install dependencies
npm start       # dev server at http://localhost:5173
npm run build   # production build → dist/
```

## Built with

- React 19 + TypeScript 4.9
- React Router 7
- SCSS
- Vite
- .NET backend
