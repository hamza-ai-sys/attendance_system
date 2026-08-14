import Link from "next/link";
import { logout } from "../../../(auth)/login/actions";

type EmployeesHeaderProps = {
  subtitle: string;
  title: string;
  showAddEmployee?: boolean;
};

export function EmployeesHeader({
  subtitle,
  title,
  showAddEmployee = false
}: EmployeesHeaderProps) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
      </div>
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        {showAddEmployee && (
          <Link
            href="/employees/new"
            className="back-link"
            style={{ borderColor: "rgba(139, 92, 246, 0.4)", color: "#c084fc" }}
          >
            + Add Employee
          </Link>
        )}
        <Link href={showAddEmployee ? "/" : "/employees"} className="back-link">
          ← {showAddEmployee ? "Home" : "Employees"}
        </Link>
        <form action={logout}>
          <button type="submit" className="logout-btn">
            Sign Out
          </button>
        </form>
      </div>
    </header>
  );
}
