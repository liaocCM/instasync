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
      { index: true, element: <Navigate to="guest" replace /> },
      {
        path: '',
        element: <ProtectedAuthRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              {
                path: 'guest',
                element: <Guest />
              },
              // admin
              {
                path: '',
                element: <ProtectedAdminRoute />,
                children: [
                  {
                    path: 'app',
                    element: <DisplayApp />,
                    children: [
                      // {
                      //   index: true,
                      //   element: <Navigate to="video-bullets" replace />
                      // },
                      // {
                      //   path: 'video-bullets',
                      //   element: <VideoBulletsPlayer />
                      // },
                      // { path: 'photo-wall', element: <PhotoWall /> }
                    ]
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
