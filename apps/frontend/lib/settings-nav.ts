import {
  LayoutDashboardIcon,
  Building2Icon,
  CreditCardIcon,
  BellIcon,
  UsersIcon,
  SlidersHorizontalIcon,
  ReceiptIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SettingsNavItem {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  disabled: boolean;
  exact?: boolean;
}

export const settingsNavItems: readonly SettingsNavItem[] = [
  {
    href: "/settings",
    title: "Overview",
    description: "Overview of all settings sections.",
    icon: LayoutDashboardIcon,
    disabled: false,
    exact: true,
  },
  {
    href: "/settings/general",
    title: "General",
    description:
      "Set business currency, decimal places, and date format used across your company.",
    icon: SlidersHorizontalIcon,
    disabled: false,
  },
  {
    href: "/settings/company-profile",
    title: "Company Profile",
    description:
      "Manage your business name, contact details, logo, and create a digital business card to share.",
    icon: Building2Icon,
    disabled: false,
  },
  {
    href: "/settings/taxes",
    title: "Taxes & GST",
    description:
      "Configure tax rates, create tax groups, and manage state of supply settings.",
    icon: ReceiptIcon,
    disabled: false,
  },
  {
    href: "#",
    title: "Billing",
    description: "Manage subscription, invoices, and payment methods.",
    icon: CreditCardIcon,
    disabled: true,
  },
  {
    href: "#",
    title: "Notifications",
    description: "Configure email and in-app notification preferences.",
    icon: BellIcon,
    disabled: true,
  },
  {
    href: "#",
    title: "Team",
    description: "Invite team members and manage permissions.",
    icon: UsersIcon,
    disabled: true,
  },
];
