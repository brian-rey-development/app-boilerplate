---
name: add-migration
description: Walkthrough for adding a new Drizzle migration safely
---

# Add Migration

Follow these steps when modifying the database schema.

## Step 1: Modify Schema

Edit `packages/db/src/schema/<table>.ts` with the new column, table, or index.

## Step 2: Generate Migration

```bash
pnpm db:generate
```

Inspect the generated SQL in `packages/db/migrations/`.

## Step 3: Verify Migration

- Check the `up` and `down` SQL are correct
- Check foreign keys reference the right tables
- Check defaults and constraints
- Verify RLS policies are still correct (add policies for new tables)

## Step 4: Run Locally

```bash
pnpm db:migrate
```

## Step 5: Update Seed

Add seed data for the new table/columns in `packages/db/src/seed.ts`.

```bash
pnpm db:seed
```

## Step 6: Verify RLS

For new tables that hold organization-scoped data, ensure RLS policies exist in the migration SQL:
```sql
alter table <table> enable row level security;
create policy "org access" on <table>
  using (org_id in (
    select org_id from org_members where user_id = auth.uid()
  ));
```
