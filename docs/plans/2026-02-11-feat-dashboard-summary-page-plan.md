---
title: "feat: Dashboard Summary Page"
type: feat
date: 2026-02-11
---

# Dashboard Summary Page

## Overview

Replace the placeholder dashboard at `classifier/src/app/(dashboard)/dashboard/page.tsx` with a functional summary page showing key metrics, recent activity, and quick actions. The page gives users an at-a-glance view of their classification pipeline.

## Problem Statement / Motivation

The current dashboard is three empty skeleton boxes. Users land here after login and see nothing useful. They need to immediately understand: how many jobs are running, what needs attention (review queue), and what happened recently.

## Proposed Solution

Add a single `jobs.dashboardStats` tRPC query that returns all dashboard data in one round-trip, then build three UI sections: summary cards, activity feed, and quick actions.

## Technical Approach

### 1. tRPC Query: `jobs.dashboardStats`

**File:** `classifier/src/server/api/routers/jobs.ts`

Add a new `protectedProcedure` query that runs three Prisma queries in parallel via `Promise.all`:

```typescript
dashboardStats: protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.session.user.id;
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [jobsByStatus, recentJobCount, reviewCount, totalPages, recentActivity] =
    await Promise.all([
      // 1. Jobs grouped by status
      ctx.db.classificationJob.groupBy({
        by: ["status"],
        where: { userId },
        _count: true,
      }),

      // 2. Jobs created in last 7 days
      ctx.db.classificationJob.count({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
      }),

      // 3. Segments requiring review (across all user's jobs)
      ctx.db.classificationSegment.count({
        where: { job: { userId }, requiresReview: true },
      }),

      // 4. Total pages processed (sum of totalPages for COMPLETED jobs)
      ctx.db.classificationJob.aggregate({
        where: { userId, status: "COMPLETED" },
        _sum: { totalPages: true },
      }),

      // 5. Last 10 completed/failed jobs for activity feed
      ctx.db.classificationJob.findMany({
        where: { userId, status: { in: ["COMPLETED", "FAILED"] } },
        include: { _count: { select: { segments: true } } },
        orderBy: { completedAt: "desc" },
        take: 10,
      }),
    ]);

  return {
    jobsByStatus, // Array<{ status, _count }>
    recentJobCount, // number
    reviewCount, // number
    totalPages: totalPages._sum.totalPages ?? 0, // number
    recentActivity, // Array<Job & { _count: { segments } }>
  };
});
```

**Design decisions:**
- "Recent Jobs" = created in last 7 days (by `createdAt`)
- "Total Pages Processed" = sum of `totalPages` for COMPLETED jobs only
- "Segments Requiring Review" = total segment count (not job count)
- Activity feed excludes CANCELLED jobs (only COMPLETED and FAILED)
- All queries filter by `userId` for multi-tenancy
- Leverages existing indexes: `status`, `createdAt`, `requiresReview`

### 2. Dashboard Client Component

**New file:** `classifier/src/components/dashboard/dashboard-content.tsx`

Single `"use client"` component that:
- Calls `api.jobs.dashboardStats.useQuery()`
- Polls every 10s only if user has active (non-terminal) jobs — requires a lightweight check, or simply always poll at 30s for simplicity
- Renders three sections: Summary Cards, Recent Activity, Quick Actions
- Shows skeleton loading state on initial load
- Shows empty state for new users (zero jobs)

### 3. Summary Cards Section

Four cards in a responsive grid (`grid-cols-2 md:grid-cols-4`):

| Card | Value | Detail |
|------|-------|--------|
| Total Jobs | Sum of all statuses | Small breakdown: "X active, Y completed, Z failed" |
| Recent (7d) | `recentJobCount` | "Jobs started this week" |
| Needs Review | `reviewCount` | Segment count with amber accent |
| Pages Processed | `totalPages` | Sum across completed jobs |

Follow the existing `JobSummary` pattern (`dl` grid with `dt`/`dd`). Use `Card` component from shadcn.

### 4. Recent Activity Feed

Table/list showing last 10 completed/failed jobs:

| Column | Source |
|--------|--------|
| File name | `sourceFileName` |
| Status | `StatusBadge` component (existing) |
| Segments | `_count.segments` |
| Duration | `completedAt - startedAt` formatted as "Xm Ys" |
| Date | `completedAt` relative time ("2 hours ago") |

- Each row is a clickable `Link` to `/jobs/{id}`
- Empty state: "No completed jobs yet. Upload a document to get started."
- Reuse existing `StatusBadge` component

### 5. Quick Actions

Two action buttons/links below the summary cards:

1. **Upload Document** — `Link` to `/loans` (where upload flow lives)
   - Icon: upload icon from hugeicons
   - Secondary variant button

2. **Review Queue** — `Link` to `/jobs` (can add `?filter=review` later)
   - Icon: review/checklist icon from hugeicons
   - Shows count badge if `reviewCount > 0`
   - Secondary variant button

### 6. Update Dashboard Page

**File:** `classifier/src/app/(dashboard)/dashboard/page.tsx`

Replace skeleton placeholders with:

```typescript
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function DashboardPage() {
  return <DashboardContent />;
}
```

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `classifier/src/server/api/routers/jobs.ts` | Edit | Add `dashboardStats` query |
| `classifier/src/components/dashboard/dashboard-content.tsx` | Create | Main dashboard client component |
| `classifier/src/app/(dashboard)/dashboard/page.tsx` | Edit | Replace placeholder with `DashboardContent` |

## Acceptance Criteria

- [x] Dashboard shows 4 summary cards with real data from the database
- [x] Activity feed shows last 10 completed/failed jobs with status, filename, segment count, duration
- [x] Clicking an activity feed row navigates to `/jobs/{id}`
- [x] Quick action links navigate to `/loans` and `/jobs`
- [x] Empty state shown for users with no jobs (CTA to upload)
- [x] Loading skeleton shown while data fetches
- [x] All data filtered by authenticated user (multi-tenant)
- [x] Review count badge shown on Review Queue action when > 0

## Edge Cases Handled

- **New user (zero jobs):** Empty state with "Upload your first document" CTA
- **All failed jobs:** Summary cards still show correct counts, activity feed shows failed jobs
- **No recent activity:** "Recent (7d)" card shows 0, activity feed may show older jobs
- **CANCELLED jobs:** Included in total count via `jobsByStatus`, excluded from activity feed

## Dependencies & Risks

- No new dependencies needed — uses existing shadcn UI, tRPC, Prisma
- No database migration required
- No risk to existing functionality (additive change only)
- Prisma `groupBy` and `aggregate` are well-supported and leverage existing indexes

## References

- Existing summary pattern: `classifier/src/components/jobs/job-summary.tsx`
- Existing list pattern: `classifier/src/components/jobs/jobs-list.tsx`
- StatusBadge: `classifier/src/components/jobs/status-badge.tsx`
- tRPC setup: `classifier/src/server/api/routers/jobs.ts`
- Prisma schema: `classifier/prisma/schema.prisma`
