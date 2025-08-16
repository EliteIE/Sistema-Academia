Setup rapido (Supabase + Rotas + CI)

1) Crie .env a partir de .env.example.
2) Instale deps:
   npm i @tanstack/react-query react-router-dom zod react-hook-form @hookform/resolvers @supabase/supabase-js
3) Em src/main.tsx, envolva com Providers + RouterProvider (veja exemplo no arquivo).
4) Se necessario, adicione alias '@' no vite.config.ts para 'src'.
5) Aplique a migracao SQL em supabase/migrations.
6) Rode: npm run dev.
