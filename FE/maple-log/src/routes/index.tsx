import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import GrowthPage from '../pages/GrowthPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import LogPage from '../pages/LogPage'
import NotFoundPage from '../pages/NotFoundPage'
import OAuthCallbackPage from '../pages/OAuthCallbackPage'
import SchedulePage from '../pages/SchedulePage'
import SettingsPage from '../pages/SettingsPage'
import ProtectedRoute from './ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/oauth/callback', element: <OAuthCallbackPage /> },
  {
    element: <Layout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/schedule', element: <SchedulePage /> },
          { path: '/growth', element: <GrowthPage /> },
          { path: '/log', element: <LogPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
