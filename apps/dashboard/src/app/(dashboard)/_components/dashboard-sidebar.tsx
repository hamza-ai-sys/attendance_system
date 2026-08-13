"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DashboardModule } from "../_lib/dashboard-modules";
import { getNavigationGroups } from "../_lib/dashboard-navigation";

type DashboardSidebarProps = {
  modules: DashboardModule[];
  onNavigate: () => void;
  open: boolean;
};

function isCurrentRoute(pathname: string, href: string): boolean {
  if (href === "/") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar({ modules, onNavigate, open }: DashboardSidebarProps) {
  const pathname = usePathname();
  const groups = getNavigationGroups(modules);

  return (
    <aside
      className={`dashboard-sidebar${open ? " is-open" : ""}`}
      aria-label="Main navigation"
      id="dashboard-navigation"
    >
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark" aria-hidden="true">
          A
        </span>
        <div>
          <strong>Attendance</strong>
          <span>Management System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <Link
          aria-current={pathname === "/" ? "page" : undefined}
          className={`sidebar-link${pathname === "/" ? " is-active" : ""}`}
          href="/"
          onClick={onNavigate}
        >
          <span className="sidebar-link-dot" aria-hidden="true" />
          Dashboard
        </Link>

        {groups.map((group) => (
          <div className="sidebar-group" key={group.label}>
            <p className="sidebar-group-label">{group.label}</p>
            {group.modules.map((module) => {
              const active = isCurrentRoute(pathname, module.href);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`sidebar-link${active ? " is-active" : ""}`}
                  href={module.href}
                  key={module.href}
                  onClick={onNavigate}
                >
                  <span className="sidebar-link-dot" aria-hidden="true" />
                  {module.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">Secure workforce portal</div>
    </aside>
  );
}
