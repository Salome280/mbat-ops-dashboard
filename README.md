# MBAT Operations Dashboard

Internal dashboard for managing MBAT operations, built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **dnd-kit** for drag-and-drop.

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Features

- Dashboard summary with sponsorship KPIs and task overviews
- Sections:
  - Marketing Communication
  - Merchandise
  - Finance and Legal
  - School Relationships
  - Sponsorship
- Kanban and table views per section
- Add / edit / delete tasks
- Sponsorship pipeline with stages, deal values, probabilities, and expected revenue
- Drag and drop between status / pipeline columns (local state only for now)

The state is held in `useTasksState` and can later be swapped to a backend (e.g. Firebase) without changing the UI components.
