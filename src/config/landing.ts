import {
  Blocks,
  Boxes,
  Building2,
  Car,
  Factory,
  GraduationCap,
  Landmark,
  Layers,
  LineChart,
  Lock,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
  Truck,
  UtensilsCrossed,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import dealershipImage from "@/assets/industry-dealership.jpg";
import healthcareImage from "@/assets/industry-healthcare.jpg";
import legalImage from "@/assets/industry-legal.jpg";
import logisticsImage from "@/assets/industry-logistics.jpg";
import restaurantImage from "@/assets/industry-restaurant.jpg";
import retailImage from "@/assets/industry-retail.jpg";

export interface CopyBlock {
  title: string;
  body: string;
  icon: LucideIcon;
}

export interface IndustryCard {
  name: string;
  summary: string;
  image: string;
  icon: LucideIcon;
}

export interface ProcessStep {
  step: string;
  title: string;
  body: string;
}

/** Operational realities Axiom is built to remove. */
export const PROBLEMS: CopyBlock[] = [
  {
    icon: Layers,
    title: "Operations split across disconnected tools",
    body: "Spreadsheets for stock, chat threads for approvals, a separate ledger for accounting. Nobody has one number they trust.",
  },
  {
    icon: Workflow,
    title: "Software that ignores how you actually work",
    body: "Generic ERPs force a dealership, a clinic and a restaurant through the same rigid workflow, then charge for the customisation.",
  },
  {
    icon: LineChart,
    title: "Months of implementation before the first result",
    body: "Traditional rollouts consume a quarter or more in configuration before a single team member logs in.",
  },
];

/** What the platform provides in place of those problems. */
export const SOLUTIONS: CopyBlock[] = [
  {
    icon: Building2,
    title: "One isolated workspace per business",
    body: "Every business runs in its own tenant. Isolation is enforced by row-level security in the database, not by application code.",
  },
  {
    icon: Blocks,
    title: "Modular by construction",
    body: "Sales, inventory, finance, people and industry modules activate independently. Add capability without migrations or downtime.",
  },
  {
    icon: ShieldCheck,
    title: "Governance from day one",
    body: "Role templates, granular permissions and a complete audit trail across every action, actor and record.",
  },
];

/** Platform capability grid. */
export const CAPABILITIES: CopyBlock[] = [
  {
    icon: Building2,
    title: "Multi-tenant core",
    body: "Unlimited businesses on a single deployment, each with its own data, users, settings and billing relationship.",
  },
  {
    icon: Users,
    title: "Roles and permissions as data",
    body: "Owner, Admin, Manager, Sales, Accountant and HR ship as templates. Create your own roles and permission sets without code.",
  },
  {
    icon: Boxes,
    title: "Module registry",
    body: "Every capability is a registered module with its own permissions, navigation and lifecycle — governed centrally.",
  },
  {
    icon: Lock,
    title: "Security architecture",
    body: "Database-level isolation, privileged operations behind verified server functions, and an extension path to MFA and SSO.",
  },
  {
    icon: LineChart,
    title: "Operational reporting",
    body: "Every module writes to a shared reporting surface, so leadership sees one consistent view of the business.",
  },
  {
    icon: ShieldCheck,
    title: "Complete audit trail",
    body: "Actor, entity, action and metadata recorded per workspace for compliance reviews and internal accountability.",
  },
];

export const INDUSTRIES: IndustryCard[] = [
  {
    name: "Automobile dealerships",
    summary: "Inventory, test drives, reservations, financing paperwork and commission tracking.",
    image: dealershipImage,
    icon: Car,
  },
  {
    name: "Retail & wholesale",
    summary: "Multi-location stock, purchasing, pricing, returns and daily sales reconciliation.",
    image: retailImage,
    icon: ShoppingBag,
  },
  {
    name: "Healthcare",
    summary: "Patient records, scheduling, billing and clinical governance with strict access control.",
    image: healthcareImage,
    icon: Stethoscope,
  },
  {
    name: "Law firms",
    summary: "Matters, billable time, retainers, document custody and client confidentiality boundaries.",
    image: legalImage,
    icon: Scale,
  },
  {
    name: "Restaurants",
    summary: "Recipes, food cost, shift rosters, supplier orders and location-level performance.",
    image: restaurantImage,
    icon: UtensilsCrossed,
  },
  {
    name: "Logistics",
    summary: "Fleet, dispatch, warehouse movements, proof of delivery and route profitability.",
    image: logisticsImage,
    icon: Truck,
  },
];

/** Additional verticals covered by the same generated-workspace model. */
export const ADDITIONAL_INDUSTRIES: { name: string; icon: LucideIcon }[] = [
  { name: "Education", icon: GraduationCap },
  { name: "Finance", icon: Landmark },
  { name: "Manufacturing", icon: Factory },
  { name: "Professional services", icon: Users },
];

export const WORKSPACE_GENERATION_STEPS: ProcessStep[] = [
  {
    step: "01",
    title: "Describe your business",
    body: "Tell Axiom what you do, how work moves through your business and who is responsible for each stage. Plain language, no configuration screens.",
  },
  {
    step: "02",
    title: "Axiom composes your workspace",
    body: "The platform selects the modules, role structure, permissions and records your operation needs, then provisions an isolated workspace.",
  },
  {
    step: "03",
    title: "Invite your team and operate",
    body: "Each person signs in to the responsibilities of their role. Add modules, refine permissions and extend the workspace as you grow.",
  },
];

export const HOW_IT_WORKS: ProcessStep[] = [
  {
    step: "01",
    title: "Create your workspace",
    body: "Register with your business name and contact details. Your isolated tenant, owner account and trial subscription are provisioned immediately.",
  },
  {
    step: "02",
    title: "Activate your modules",
    body: "Start with the modules matched to your industry, then switch further capability on from the module registry at any time.",
  },
  {
    step: "03",
    title: "Structure your team",
    body: "Assign role templates or define your own, then invite staff. Permissions apply consistently across every module.",
  },
  {
    step: "04",
    title: "Run and review",
    body: "Daily operations, reporting and a full audit trail in one place — with leadership visibility across every part of the business.",
  },
];

export const TRUST_COMMITMENTS: CopyBlock[] = [
  {
    icon: Lock,
    title: "Isolation you can verify",
    body: "Tenant boundaries are enforced by row-level security policies on every table, reviewed on every schema change.",
  },
  {
    icon: ShieldCheck,
    title: "Least-privilege access",
    body: "Privileged operations run only through verified server functions. No client ever holds elevated database credentials.",
  },
  {
    icon: Layers,
    title: "Your data stays yours",
    body: "Complete export of your workspace records at any time, and a documented deletion path when you leave.",
  },
];

export const FAQS: { question: string; answer: string }[] = [
  {
    question: "How is my business data kept separate from other businesses?",
    answer:
      "Every record carries a tenant reference, and row-level security policies scope reads and writes to your workspace membership. Isolation is enforced by the database itself, so no application-level mistake can expose another business's data.",
  },
  {
    question: "What does an AI-generated workspace actually produce?",
    answer:
      "A description of your operation is translated into a concrete workspace: the modules that are activated, the role structure, the permission assignments and the record types your team works with. Everything it produces remains fully editable by you.",
  },
  {
    question: "Can I define roles that match our own structure?",
    answer:
      "Yes. Roles and permissions are stored as data rather than hardcoded. The six supplied roles are starting templates — you can create workspace-specific roles with any combination of permissions.",
  },
  {
    question: "Do you support MFA and single sign-on?",
    answer:
      "Authentication is implemented behind one service boundary, so one-time codes, multi-factor authentication and enterprise SSO can be enabled for your workspace without any change to your accounts or data.",
  },
  {
    question: "Can Axiom handle multiple locations or business units?",
    answer:
      "Yes. A workspace supports multiple locations and business units, with permissions and reporting scoped per unit so managers see only what they are responsible for.",
  },
  {
    question: "How do we migrate from spreadsheets or an existing system?",
    answer:
      "Records import through structured files per module, and the module registry lets you move one area of the business at a time rather than switching everything at once.",
  },
];

export const FOOTER_SECTIONS: { label: string; links: { label: string; to: string }[] }[] = [
  {
    label: "Platform",
    links: [
      { label: "Capabilities", to: "/#capabilities" },
      { label: "Workspace generation", to: "/#workspace-generation" },
      { label: "Industries", to: "/#industries" },
      { label: "Pricing", to: "/#pricing" },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "Documentation", to: "/docs" },
      { label: "How it works", to: "/#how-it-works" },
      { label: "FAQ", to: "/#faq" },
    ],
  },
  {
    label: "Account",
    links: [
      { label: "Sign in", to: "/login" },
      { label: "Create workspace", to: "/register" },
    ],
  },
];
