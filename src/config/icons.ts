import {
  Blocks,
  Calculator,
  Car,
  GraduationCap,
  HardHat,
  HeartPulse,
  KanbanSquare,
  LayoutDashboard,
  Package,
  Scale,
  UtensilsCrossed,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps the `icon` string stored on module rows to a component.
 * New modules only need a row in the database plus an entry here.
 */
const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Package,
  Users,
  Calculator,
  Wallet,
  KanbanSquare,
  Car,
  HeartPulse,
  UtensilsCrossed,
  HardHat,
  Scale,
  GraduationCap,
};

export function resolveIcon(name?: string | null): LucideIcon {
  return (name && ICONS[name]) || Blocks;
}
