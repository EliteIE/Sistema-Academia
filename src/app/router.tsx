import { createBrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Members from '@/pages/Members';

export const router = createBrowserRouter([
  { path: '/', element: <Dashboard /> },
  { path: '/alunos', element: <Members /> },
]);
