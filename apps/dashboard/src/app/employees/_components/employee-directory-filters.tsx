type EmployeeDirectoryFiltersProps = {
  roleFilter: string;
  searchTerm: string;
  setRoleFilter: (value: string) => void;
  setSearchTerm: (value: string) => void;
};

export function EmployeeDirectoryFilters({
  roleFilter,
  searchTerm,
  setRoleFilter,
  setSearchTerm
}: EmployeeDirectoryFiltersProps) {
  return (
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
      <input
        type="search"
        className="form-control"
        placeholder="Search by name, email, or code..."
        aria-label="Search employees"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        style={{ flex: 1, minWidth: "240px" }}
      />
      <select
        className="form-control"
        aria-label="Filter employees by role"
        value={roleFilter}
        onChange={(event) => setRoleFilter(event.target.value)}
        style={{ width: "180px" }}
      >
        <option value="all">All Roles</option>
        <option value="owner">Owner</option>
        <option value="hr">HR</option>
        <option value="manager">Manager</option>
        <option value="employee">Employee</option>
      </select>
    </div>
  );
}
