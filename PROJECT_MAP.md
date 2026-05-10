# PROJECT_MAP — ERP Manufacturing (Aluminum/Glass/UPVC/Curtain Wall/ACP)

## TECH_STACK

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Runtime | Node.js | 22.14.0 | LTS |
| Framework | Next.js | 16.2.6 | App Router, Webpack (WASM SWC) |
| Language | TypeScript | 5.x | strict mode |
| UI | Tailwind CSS | 4.2.4 | Oxide engine, CSS-first |
| Database | PostgreSQL | 18.3 | via @prisma/adapter-pg |
| ORM | Prisma | 7.8.0 | Rust-free, client-js provider |
| Auth | NextAuth.js | 4.24.14 | JWT strategy, @auth/prisma-adapter |
| Validation | Zod | ^3 | Shared schema validation |
| Logging | Custom async logger | — | Buffered, 3 levels (ERR/WARN/INFO) |
| Cache/Queue | Valkey 8.1 | 8.1.0 | Redis-compatible, running in Docker |
| File Storage | MinIO (S3) | latest | Running in Docker, /api/upload endpoint |
| i18n | Custom | — | AR/EN, cookie-based, locale switcher component |
| Testing | Vitest | 4.1.5 | jsdom environment, 4 tests |

## SYSTEM_FLOW

```
Browser → Next.js 16 (SSR/CSR)
            ├── Server Components → getServerSession → Prisma 7 → PostgreSQL 18
            ├── API Routes → auth gate → domain logic → Prisma → PG
            ├── Server Actions → mutate → revalidate cache
            └── proxy.ts → auth guard on /dashboard/*

Auth:  NextAuth v4 → JWT → proxy.ts middleware
Logs:  Server Action → writeAuditLog() → audit_logs table
Files: API Route → MinIO (S3-compatible)
```

## ARCHITECTURE

```
erp-manufacturing/
├── prisma/
│   └── schema.prisma          # 18 models, 8 domains
├── prisma.config.ts            # Prisma 7 config (datasource URL)
├── src/
│   ├── core/                   # Shared kernel (actual reuse only)
│   │   ├── auth/auth.ts        # NextAuth config + handler
│   │   ├── audit/logger.ts     # Async buffered logger
│   │   ├── audit/service.ts    # Audit log DB writer
│   │   ├── notifications/      # (stub)
│   │   └── storage/            # (stub)
│   ├── domains/                # Domain-Driven modules
│   │   ├── sales/              # Leads, Quotations, Pipeline
│   │   │   ├── types.ts        # Zod schemas
│   │   │   ├── queries.ts      # Prisma read operations
│   │   │   ├── actions.ts      # Server actions (mutations)
│   │   │   ├── routes.ts       # API route handler
│   │   │   └── components/     # React components (future)
│   │   ├── projects/           # Tasks, DailyReports
│   │   ├── procurement/        # Suppliers, PO, Inventory
│   │   ├── production/         # Orders, QualityChecks
│   │   ├── finance/            # Expenses (stub)
│   │   ├── hr/                 # Attendance (stub)
│   │   ├── engineering/        # Drawings (stub)
│   │   └── customer-service/   # SupportTickets (stub)
│   ├── lib/
│   │   ├── prisma.ts           # PrismaClient singleton + PG adapter
│   │   └── get-session.ts      # getServerSession wrapper
│   ├── features/               # Shared UI (future)
│   ├── types/
│   │   └── next-auth.d.ts      # Session type augmentation
│   ├── proxy.ts                # Next.js 16 proxy (middleware)
│   ├── generated/prisma/       # Prisma client (gitignored)
│   └── app/                    # Next.js App Router
│       ├── (auth)/login/       # Login page
│       ├── dashboard/          # Dashboard (stats cards)
│       ├── api/auth/[...nextauth]/  # NextAuth handler
│       └── page.tsx            # Root redirect
└── .env                        # DB URL, NEXTAUTH_SECRET
```

## DOMAIN MODELS (18 tables)

| Model | Domain | Priority | Key Fields |
|-------|--------|----------|------------|
| User | Core | HIGH | email, role (ADMIN/MANAGER/VIEWER) |
| AuditLog | Core | HIGH | action, entity, entityId, userId, metadata |
| Notification | Core | MED | userId, title, type, isRead |
| Lead | Sales | HIGH | company, contact, stage, score, estimatedValue |
| Quotation | Sales | HIGH | leadId, items (JSON), subtotal, discount, total |
| Project | Projects | HIGH | name, status, dates, budget, actualCost |
| Task | Projects | HIGH | projectId, title, assignee, dueDate, status |
| DailyReport | Projects | HIGH | projectId, summary, photos (JSON), weather |
| Supplier | Procurement | HIGH | name, contact, category, rating |
| PurchaseOrder | Procurement | HIGH | supplierId, items (JSON), totalAmount, status |
| InventoryItem | Procurement | HIGH | sku, name, quantity, minQuantity, unitCost |
| ProductionOrder | Production | HIGH | orderNumber, productName, quantity, status |
| QualityCheck | Production | HIGH | productionOrderId, stage, passed |
| SupplierEvaluation | Procurement | MED | supplierId, score, criteria (JSON) |
| Drawing | Engineering | MED | projectId, title, version, fileUrl |
| SupportTicket | CustomerService | MED | customerName, subject, category, status |
| Attendance | HR | HIGH | userId, date, checkIn, checkOut, status |
| Expense | Finance | HIGH | projectId, category, description, amount |

## ORPHANS & PENDING

- [PENDING] Finance, HR, Engineering, Customer Service domains — schemas exist, server actions and routes not yet implemented
- [PENDING] AI integration — lead scoring, quotation generation, competitor analysis, chatbot RAG pipeline
- [PENDING] Valkey/Redis — not yet connected; needed for caching, queues, SSE
- [PENDING] MinIO/S3 — file upload for drawings, site photos, reports
- [PENDING] Executive Dashboard — cross-domain KPIs and real-time updates
- [PENDING] PDF generation — automated client reports, quotations
- [PENDING] Email notifications — triggers on lead stage change, PO receipt, ticket resolution
- [PENDING] Missing pages: `/dashboard/sales`, `/dashboard/projects`, `/dashboard/procurement`, `/dashboard/production`
- [PENDING] Seeding script for initial admin user + demo data
- [DONE] i18n — Arabic/English support with RTL, cookie persistence, locale switcher
- [DONE] Unit tests — Vitest setup with 4 passing tests
