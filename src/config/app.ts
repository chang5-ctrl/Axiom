/** Single source of truth for platform-wide constants. No hardcoded strings in components. */
export const APP = {
  name: "Rocdwels AI",
  tagline: "The intelligent operating system for businesses",
  description:
    "Rocdwels AI is a modular, multi-tenant ERP platform powered by AI workspace generation. One deployment, isolated workspaces, and modules you switch on as you grow.",
  supportEmail: "support@rocdwels.ai",
  trialDays: 14,
} as const;

export const ROUTES = {
  landing: "/",
  login: "/login",
  register: "/register",
  app: "/app",
  superAdmin: "/super-admin",
} as const;
