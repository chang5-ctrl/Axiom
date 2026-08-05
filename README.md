# Axiom Core

You are building the foundation of a production-ready SaaS platform called Axiom.

Do NOT build a demo.

Build clean architecture that can scale for years.

## Product

Axiom is a modular AI-powered Multi-Tenant ERP platform.

Every business gets its own isolated workspace.

One deployment.

One codebase.

Unlimited businesses.

Everything must be modular.

Do not hardcode business logic.

Design for future growth.

---

## Technology

Use the latest Lovable stack.

Frontend:

- React

- TypeScript

- Tailwind

- shadcn/ui

Backend

- Supabase

- PostgreSQL

- Row Level Security

- Supabase Auth

- Supabase Storage

Hosting

- Vercel

---

## IMPORTANT

Keep the implementation SIMPLE.

Do NOT add:

- Redis

- RabbitMQ

- Kubernetes

- Docker

- Microservices

- Complex Event Bus

- External AI APIs

The architecture should support these later but should not depend on them.

---

## Authentication

Business Owner registers with

Business Name

Email

Phone Number

Password

No OTP.

Authentication must be designed so OTP and MFA can be added later without rewriting the system.

---

## Multi Tenant

This is the highest priority.

Every business is a tenant.

Every table must support tenant isolation.

Every tenant must only see their own data.

Use Supabase Row Level Security.

---

## Create the core database

Tenants

Users

Roles

Permissions

Subscriptions

Plans

Audit Logs

Settings

Business Profiles

Keep everything modular.

---

## Role System

Owner

Admin

Manager

Sales

Accountant

HR

Allow future custom roles.

Permissions should be dynamic.

Do not hardcode permissions.

---

## Routing

Create

/

Landing Page

/login

Login

/register

Registration

/app

Tenant Dashboard

/admin

Super Admin Dashboard

---

## Landing Page

Modern SaaS design.

Professional.

Minimal.

Sections

Hero

Features

Supported Businesses

Pricing

FAQ

CTA

---

## Registration Flow

Business Name

↓

Email

↓

Phone Number

↓

Password

↓

Business Description

↓

Workspace Created

↓

Dashboard

Do NOT implement AI.

Simply save the business description.

We will build the Business Classifier later.

---

## Tenant Dashboard

Only build the shell.

Sidebar

Top Navigation

Notifications

Profile

Settings

Empty dashboard cards.

Do not build modules yet.

---

## Super Admin

Create a completely separate admin dashboard.

This dashboard manages the platform.

Include placeholder pages for

Dashboard

Tenants

Subscriptions

Payments

Analytics

Modules

Announcements

Feature Flags

Support

Settings

Logs

No functionality yet.

Only architecture.

---

## Billing

Do NOT integrate payment gateways.

Create database tables and UI only.

Plans

Starter

Growth

Business

Enterprise

Payment Status

Pending

Approved

Rejected

Expired

---

## Code Quality

Use reusable components.

Reusable layouts.

Reusable hooks.

Reusable services.

Strong TypeScript types.

Good folder structure.

No duplicated code.

No hardcoded values.

---

## Future Proofing

Design the system so future features can plug into it.

Examples

Inventory

CRM

Accounting

Payroll

Projects

Vehicle Dealership

Hospital

Restaurant

Construction

Law Firm

School

None of these should be implemented yet.

Only prepare the architecture.

---

## Final Deliverable

Build a beautiful production-quality foundation.

Think like you are building the operating system for businesses, not just another ERP.

Focus entirely on architecture, authentication, multi-tenancy, routing, layouts, database structure, and scalability.

Leave extension points for future modules.

This is Phase 0.

Nothing else.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5c3ebfa0-cf2f-46fd-9865-cb84dc6b246d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
