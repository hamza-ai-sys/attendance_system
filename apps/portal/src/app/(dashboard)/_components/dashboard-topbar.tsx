"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../../(auth)/login/actions";
import type { DashboardModule } from "../_lib/dashboard-modules";
import { getPageTitle } from "../_lib/dashboard-navigation";

type DashboardTopbarProps = {
  fullName: string;
  modules: DashboardModule[];
  onOpenSidebar: () => void;
  roleName: string;
  sidebarOpen: boolean;
};

function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function DashboardTopbar({
  fullName,
  modules,
  onOpenSidebar,
  roleName,
  sidebarOpen
}: DashboardTopbarProps) {
  const pathname = usePathname();

  return (
    <header className="dashboard-topbar">
      <div className="dashboard-topbar-title">
        <button
          aria-controls="dashboard-navigation"
          aria-expanded={sidebarOpen}
          aria-label="Open navigation"
          className="sidebar-menu-button"
          onClick={onOpenSidebar}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
        <div>
          <span className="dashboard-topbar-eyebrow">Workforce Portal</span>
          <h1>{getPageTitle(pathname, modules)}</h1>
        </div>
      </div>

      <div className="dashboard-account">
        <Link className="dashboard-user" href="/my-profile" aria-label="Open my profile">
          <span className="dashboard-avatar" aria-hidden="true">
            {getInitials(fullName)}
          </span>
          <span className="dashboard-user-copy">
            <strong>{fullName}</strong>
            <span>{roleName}</span>
          </span>
        </Link>
        <form action={logout}>
          <button className="dashboard-signout" type="submit">
            Sign Out
          </button>
        </form>
      </div>
    </header>
  );
}
