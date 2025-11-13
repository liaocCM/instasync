import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Guest } from '@/pages/guest';
import { AdminControlPanel } from '@/pages/admin';
import ErrorPage from '@/pages/ErrorPage';
import { AppLayout } from './pages/Layout';
import {
  ProtectedAuthRoute,
  ProtectedAdminRoute
} from './pages/ProtectedRoute';
import { DisplayApp } from './pages/app';

export const router = createBrowserRouter([
  {
    path: '',
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="wedding/guest" replace /> },
      {
        path: '',
        element: <ProtectedAuthRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: 'wedding/guest',
                element: <Guest />
              },
              // admin
              {
                path: '',
                element: <ProtectedAdminRoute />,
                children: [
                  {
                    path: 'app',
                    element: <DisplayApp />
                  },
                  { path: 'admin', element: <AdminControlPanel /> }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
]);
