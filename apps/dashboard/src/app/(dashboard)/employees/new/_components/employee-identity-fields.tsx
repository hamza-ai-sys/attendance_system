export function EmployeeIdentityFields() {
  return (
    <>
      <div className="form-group">
        <label htmlFor="fullName">Full Name *</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          className="form-control"
          placeholder="e.g. Jane Doe"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Login Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className="form-control"
          placeholder="e.g. jane@company.com"
        />
      </div>
      <div className="form-group">
        <label htmlFor="employeeCode">Employee Code</label>
        <input
          id="employeeCode"
          name="employeeCode"
          type="text"
          className="form-control"
          placeholder="e.g. EMP-105 (Optional)"
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Initial Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className="form-control"
          placeholder="Min 6 characters"
          minLength={6}
        />
      </div>
      <div className="form-group">
        <label>
          <input name="grantDashboardAccess" type="checkbox" defaultChecked /> Grant portal access
        </label>
        <span className="muted">Email and password are required only when access is granted.</span>
      </div>
    </>
  );
}
