# 🚀 Rocdwels AI — Intelligent Multi-Tenant ERP Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-87.4%25-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-11.5%25-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/vxssroott/Axiom/ci.yml?branch=main&label=CI&style=for-the-badge)](https://github.com/vxssroott/Axiom/actions)
[![GitHub Stars](https://img.shields.io/github/stars/vxssroott/Axiom?style=for-the-badge)](https://github.com/vxssroott/Axiom/stargazers)
[![Contributors](https://img.shields.io/github/contributors/vxssroott/Axiom?style=for-the-badge)](https://github.com/vxssroott/Axiom/graphs/contributors)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge)](https://github.com/vxssroott/Axiom)

---

## 📋 Executive Summary

**Rocdwels AI** is a next-generation, intelligent, modular **multi-tenant ERP (Enterprise Resource Planning) platform** powered by AI-driven workspace generation. It empowers organizations to operate from one secure, customized workspace with intelligent module composition, flexible role management, and real-time analytics.

- 🏢 **Complete Business Operations Management** — Finance, HR, Supply Chain, Manufacturing, Inventory, and more
- 🤖 **AI-Powered Workspace Generation** — Describe your business, and Rocdwels AI intelligently creates your platform configuration
- 🔐 **Enterprise-Grade Security** — Multi-tenancy, role-based access control (RBAC), encryption at rest and in transit
- 📊 **Real-Time Analytics & Insights** — Intelligent dashboards, predictive analytics, and data-driven decision making
- 🧩 **Modular Architecture** — Pick-and-mix modules; extend without touching core
- ⚡ **Horizontal Scalability** — Built for growth; handles thousands of concurrent users
- 🔌 **Seamless Integrations** — Connect with existing enterprise systems, APIs, webhooks
- 💰 **SaaS-Ready** — Multi-tenant isolation, usage-based billing, white-label capabilities

**Perfect for:** Mid-market to enterprise organizations seeking modern ERP without legacy technical debt.

---

## 🎯 Key Differentiators

| Feature | Rocdwels AI | Legacy ERP | Cloud ERPs |
|---------|-----------|-----------|----------|
| **Modern Stack** | TypeScript/React | COBOL/SAP ABAP | React/Node |
| **Modularity** | 100% plug-and-play | Monolithic | Semi-modular |
| **AI Generation** | Automatic workspace composition | Manual configuration | Manual configuration |
| **Setup Time** | Hours/Days | Weeks/Months | 2-3 weeks |
| **Multi-Tenancy** | Native | Retrofitted | Native |
| **Real-Time Analytics** | Built-in | Add-on (💰) | Premium add-on |
| **Deployment** | Cloud/On-prem | On-prem only | Cloud only |
| **Developer Experience** | Excellent | Poor | Good |
| **Total Cost of Ownership** | 60% lower | High | Medium |

---

## 🏗️ Architecture Overview

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                  Rocdwels AI Platform                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────┐      ┌──────────────────────────────┐   │
│  │  Multi-Tenant Web UI │      │  REST / GraphQL APIs         │   │
│  │  (TypeScript/React)  │      │  (TanStack Start)            │   │
│  └──────────────────────┘      └──────────────────────────────┘   │
│           │                              │                        │
│           └──────────────┬───────────────┘                        │
│                          │                                        │
│  ┌───────────────────────┴──────────────────────────────────┐    │
│  │        Authentication & Session Layer                     │    │
│  │  (JWT tokens, Supabase Auth, RBAC)                       │    │
│  └───────────────────────┬──────────────────────────────────┘    │
│                          │                                        │
│  ┌───────────────────────┴──────────────────────────────────┐    │
│  │      Modular Business Logic Layer                        │    │
│  │  ┌──────────────┬──────────────┬──────────────┐          │    │
│  │  │   Finance    │      HR      │    Supply    │ ...      │    │
│  │  │   Module     │    Module    │    Chain     │          │    │
│  │  └──────────────┴──────────────┴──────────────┘          │    │
│  │                                                           │    │
│  │  Module Service Registry & Lifecycle Manager            │    │
│  └───────────────────────┬──────────────────────────────────┘    │
│                          │                                        │
│  ┌───────────────────────┴──────────────────────────────────┐    │
│  │      Tenant & Data Isolation Layer                       │    │
│  │  (Row-Level Security, Tenant Context)                    │    │
│  └───────────────────────┬──────────────────────────────────┘    │
│                          │                                        │
│  ┌───────────────────────┴──────────────────────────────────┐    │
│  │            PostgreSQL Database Layer                     │    │
│  │  (Supabase, Migrations, Realtime Subscriptions)          │    │
│  └───────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Infrastructure: Docker, Kubernetes, Cloud Providers    │    │
│  │  (AWS, GCP, Azure, Self-Hosted)                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

See the [README.md](README.md) for the full documentation.
