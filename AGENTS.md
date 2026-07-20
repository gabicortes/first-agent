# Coach Agent

## Architecture

- Next.js App Router
- Gemini API
- API Route -> Service -> Gemini
- React UI keeps state
- Service layer contains business logic

## Current structure

src/
app/
api/chat/route.ts
page.tsx
lib/
ai.ts
services/
chat.service.ts
types/
message.ts

## Principles

- UI owns state.
- Services own business logic.
- Don't abstract too early.
- Components only when they become reusable.
