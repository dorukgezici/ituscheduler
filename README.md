<div align="center">
    <h1 align="center">ITU Scheduler</h1>
	<p align="center">Create your ITU course schedules in fashion with up-to-date & detailed information.</p>
	<p align="center"><b>Tech Stack:</b> Astro, React, Supabase &emsp; <b>UI:</b> Tailwind CSS, shadcn/ui</p>
</div>

<p align="center">
  <a href="https://github.com/dorukgezici/ituscheduler/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-GPLv3-blue.svg" alt="license" />
  </a>
  <a href="https://github.com/dorukgezici/ituscheduler/releases">
    <img alt="GitHub all releases" src="https://img.shields.io/github/downloads/dorukgezici/ituscheduler/total">
  </a>
</p>

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
├── supabase/
│   └── migrations/  # Supabase migrations
├── components.json  # shadcn config
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command               | Action                                                     |
| :-------------------- | :--------------------------------------------------------- |
| `pnpm install`        | Installs dependencies                                      |
| `pnpm run dev`        | Starts local dev server at `localhost:4321`                |
| `pnpm run build`      | Build your production site to `./vercel/`                  |
| `pnpm run sb ...`     | Run Supabase CLI commands                                  |
| `pnpm run sb-db`      | Run Supabase `db diff` to generate migrations              |
| `pnpm run sb-types`   | Generate Supabase types to `./src/types/database.types.ts` |
| `pnpm run vercel ...` | Run Vercel CLI commands                                    |
