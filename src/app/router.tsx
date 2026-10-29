import { createBrowserRouter, Navigate } from 'react-router';

import { HomePage } from '@features/home';

import { RootLayout } from './RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
