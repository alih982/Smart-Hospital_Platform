/**
 * Centralized Configuration for Smart Health Platform
 * 
 * This file now uses dynamic configuration from dynamic.ts
 * All configuration values should be set via environment variables
 * 
 * Environment Variables:
 * - NEXT_PUBLIC_API_URL: Backend API base URL
 * - NEXT_PUBLIC_WS_URL: WebSocket URL for real-time chat
 * - NEXT_PUBLIC_APP_URL: Application base URL
 * - NEXT_PUBLIC_APP_NAME: Application name
 * - NEXT_PUBLIC_API_VERSION: API version (v1, v2)
 * - NEXT_PUBLIC_ENABLE_ANALYTICS: Enable analytics tracking
 * 
 * All configurations can be changed in ONE LINE via .env file!
 */

export { config, API_BASE_URL, API_VERSION, WS_URL, APP_NAME, APP_URL, buildApiEndpoint, environment } from './dynamic';

export type { AppConfig } from './dynamic';

