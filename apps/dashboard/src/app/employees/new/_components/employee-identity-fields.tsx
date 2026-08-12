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
        <label htmlFor="email">Email Address *</label>
        <input
          id="email"
          name="email"
          type="email"
          className="form-control"
          placeholder="e.g. jane@company.com"
          required
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
        <label htmlFor="password">Initial Password *</label>
        <input
          id="password"
          name="password"
          type="password"
          className="form-control"
          placeholder="Min 6 characters"
          required
          minLength={6}
        />
      </div>
    </>
  );
}
