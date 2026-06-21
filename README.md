# DoorStop — Door Company Management Software

A full-stack management platform for door companies. Manage jobs, quotes, customers, invoices, purchase orders, and product catalogues from a single internal dashboard.

## What it does

- **Jobs** — create and track installation jobs through their full lifecycle (Scheduled → In Progress → Completed)
- **Quotes** — build and manage customer quotes, from draft through to invoiced and paid
- **Invoices** — generate and track invoices with automatic GST calculation
- **Purchase Orders** — raise and track orders with suppliers
- **Customers** — maintain customer records and contact details
- **Product Catalogue** — manage doors, cavity sliders, hinges, handles, and hardware types

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 4.9, React Router 7, SCSS, Vite |
| Backend | .NET 8 Web API, Swagger |
| HTTP Client | Axios |

## Project Structure

```
DoorStop.sln
server/                        .NET 8 Web API
  Controllers/                 one controller per resource
  Factories/                   business logic + in-memory data
  Models/                      domain models
  Program.cs
client/
  src/
    root/                      app entry, layout, routes
    pages/
      main-pages/              jobs, quotes, customers, invoices, orders
      side-pages/              doors, cavity sliders, hardware types
    components/                table, status, page-wrapper, modal, form-wrapper
    api/                       axios client
```

## Getting Started

### Backend
```bash
cd server
dotnet run
```
API runs at `https://localhost:64868` · Swagger UI at `https://localhost:64868/swagger`

### Frontend
```bash
npm run setup   # configure API URL and install dependencies
npm start       # dev server at http://localhost:5173
```

## API

Full CRUD REST API for all resources:

| Resource | Route |
|----------|-------|
| Customers | `/customer` |
| Jobs | `/job` |
| Quotes | `/quote` |
| Invoices | `/invoice` |
| Purchase Orders | `/order` |
| Door Types | `/doortype` |
| Handle Types | `/handletype` |
| Hinge Types | `/hingetype` |
| Cavity Sliders | `/cavity-slider` |

## Status

Early development — v0.1.0. Data is currently held in-memory (no database yet).
