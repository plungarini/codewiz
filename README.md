# CodeWiz

[![GitHub stars](https://img.shields.io/github/stars/plungarini/codewiz?style=social)](https://github.com/plungarini/codewiz)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](#license)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-donate-ffdd00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/wheresbebo)

An AI coding assistant with chat, repo-aware search, and a learning hub — built years before "AI harness" was a category.

CodeWiz let you chat with an AI over your own repositories, search and learn from your codebase and docs with RAG-backed retrieval, and manage it all from an admin dashboard with usage stats and feedback tracking. It shipped on Angular + Supabase edge functions + Firebase, long before agentic coding tools went mainstream.

> [!WARNING]
> **This project is archived and no longer maintained.** It's published here as a public showcase of how far ahead CodeWiz was in 2023 — chat-over-your-code, RAG search, and an agentic-adjacent workflow before most of today's AI coding tools existed.

> [!NOTE]
> **🚀 Launched on Product Hunt in 2023 — #10 Product of the Day**, 153+ upvotes and a flood of comments. [See the launch](https://www.producthunt.com/products/codewiz?launch=codewiz).

## Features

- **Chat** — conversational AI over your own code and docs.
- **Lern** — RAG-backed search and Q&A across repos and documentation (Supabase edge functions: `ai-docs`, `search`, `lern-search-docs`).
- **Admin dashboard** — chat and user stats, repo management, feedback tracking.
- **Onboarding & settings** — guided setup and per-user configuration.

## Run it locally

```bash
yarn install
yarn generate-env:dev
yarn start   # http://localhost:4200
```

## Tech

Angular 16 · Firebase (Auth, Hosting) · Supabase (Postgres + Edge Functions) · Tailwind CSS · OpenAI

## Support

<div align="center">

CodeWiz is retired, but if it inspired something you're building, a coffee or a star is appreciated.

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-donate-ffdd00?style=for-the-badge&logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/wheresbebo)
&nbsp;
[![Star on GitHub](https://img.shields.io/github/stars/plungarini/codewiz?style=for-the-badge&logo=github&label=Star%20this%20repo&color=yellow)](https://github.com/plungarini/codewiz)

</div>

## License

MIT licensed.
