export function EmployeeScheduleFields() {
  return (
    <>
      <div className="form-group">
        <label htmlFor="shiftInTime">Shift In-Time *</label>
        <input
          id="shiftInTime"
          name="shiftInTime"
          type="time"
          className="form-control"
          defaultValue="09:00"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="shiftOutTime">Shift Out-Time *</label>
        <input
          id="shiftOutTime"
          name="shiftOutTime"
          type="time"
          className="form-control"
          defaultValue="17:00"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="timezone">Timezone</label>
        <input
          id="timezone"
          name="timezone"
          type="text"
          className="form-control"
          defaultValue="Asia/Karachi"
          placeholder="e.g. Asia/Karachi"
        />
      </div>
    </>
  );
}
