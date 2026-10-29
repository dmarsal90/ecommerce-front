# Architecture

Next.js App Router, TypeScript strict, feature-based layout.

```
src/
  app/[lang]/      routes only: compose features, no business logic
  features/<x>/    domain/ (types, Zod schemas), api/ (adapters), hooks/, components/, index.ts
  components/      shared UI with no knowledge of features
  i18n/            locales, negotiation, dictionaries (en default; es, it, de, pt, fr)
  lib/             infrastructure: env, API client
```

## Rules

- **Single responsibility:** one reason to change per module; routes compose, features own behaviour.
- **Dependency inversion:** features depend on ports (e.g. `ApiClient` in `lib/api/client.ts`), never on `fetch` directly. Tests pass a fake `fetch`.
- **Open/closed:** new locales, themes or endpoints are added by adding files/entries, not by editing consumers.
- **Boundaries:** import another feature only through its `index.ts` (enforced by ESLint).
- **Validate at the edge:** every API response is parsed with Zod before it reaches a component.
- **i18n:** all copy lives in `src/i18n/dictionaries/*.json`; no hard-coded strings in components.
- **Theme:** `data-theme` on `<html>` set by an inline script before paint; colours only through CSS variables in `globals.css`.
