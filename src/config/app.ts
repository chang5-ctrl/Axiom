/** Single source of truth for platform-wide constants. No hardcoded strings in components. */
export const APP = {
  name: "Axiom",
  tagline: "The operating system for businesses",
  description:
    "Axiom is a modular, multi-tenant ERP platform. One deployment, isolated workspaces, and modules you switch on as you grow.",
  supportEmail: "support@axiom.app",
  trialDays: 14,
} as const;

export const ROUTES = {
  landing: "/",
  login: "/login",
  register: "/register",
  app: "/app",
  admin: "/admin",
} as const;
