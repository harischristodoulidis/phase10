import { createBrowserRouter, Navigate } from 'react-router';

import { GamePage } from '@features/game';
import { HomePage } from '@features/home';
import { SetupPage } from '@features/setup';

import { RootLayout } from './RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'setup', Component: SetupPage },
      { path: 'game', Component: GamePage },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
