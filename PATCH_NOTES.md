Patch aplicado por ChatGPT
Data: 2025-08-16T18:18:35

O que foi adicionado/alterado:
- .env.example
- .gitignore -> inclui .env
- .github/workflows/ci.yml -> CI basico (typecheck/lint/build)
- src/lib/supabase.ts
- src/app/providers.tsx
- src/app/router.tsx
- src/pages/Dashboard.tsx
- src/pages/Members/index.tsx (CRUD simples)
- src/types/db.ts
- supabase/migrations/*_schema_core.sql (schema completo)

Patches tentados (best-effort):
- vite.config.ts -> alias '@' para 'src' (se possivel)
- src/main.tsx -> Providers + RouterProvider (se possivel)
- package.json -> scripts e deps essenciais

Proximos passos:
1) Criar .env a partir de .env.example com as chaves do Supabase.
2) Instalar dependencias:
   npm i
   (ou, caso falte:) npm i @tanstack/react-query react-router-dom zod react-hook-form @hookform/resolvers @supabase/supabase-js
3) (Opcional) Aplicar a migracao SQL em supabase/migrations.
4) Rodar: npm run dev
5) Testar em /alunos o cadastro/listagem de alunos.
