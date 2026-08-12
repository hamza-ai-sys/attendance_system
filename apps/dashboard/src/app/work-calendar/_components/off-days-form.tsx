import { updateWeeklyOffDays } from "../actions";
import { weekdayNames } from "../queries";

const policies = [
  {
    value: "sun_only",
    title: "Sunday Only",
    description: "Mon–Sat workdays (6 days work / 1 day off)"
  },
  {
    value: "sat_sun",
    title: "Saturday & Sunday",
    description: "Mon–Fri workdays (5 days work / 2 days off)"
  },
  {
    value: "fri_sat",
    title: "Friday & Saturday",
    description: "Sun–Thu workdays (Middle East policy)"
  },
  { value: "fri_only", title: "Friday Only", description: "Sat–Thu workdays" }
];

function PolicyOption({
  policy,
  selected
}: {
  policy: (typeof policies)[number];
  selected: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <input
        type="radio"
        name="offDaysType"
        value={policy.value}
        defaultChecked={selected === policy.value}
      />
      <div>
        <strong>{policy.title}</strong>
        <div className="muted" style={{ fontSize: "0.8rem" }}>
          {policy.description}
        </div>
      </div>
    </label>
  );
}

function CustomPolicy({ offDays, selected }: { offDays: number[]; selected: string }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
      <input
        type="radio"
        name="offDaysType"
        value="custom"
        defaultChecked={selected === "custom"}
      />
      <div style={{ flex: 1 }}>
        <strong>Custom / Hybrid Schedule</strong>
        <div className="muted">Select specific off-days:</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(75px,1fr))",
            gap: 8,
            padding: 12
          }}
        >
          {weekdayNames.map((name, index) => (
            <label key={name}>
              <input
                type="checkbox"
                name="customDays"
                value={index}
                defaultChecked={offDays.includes(index)}
              />{" "}
              {name.slice(0, 3)}
            </label>
          ))}
        </div>
      </div>
    </label>
  );
}

export function OffDaysForm({
  offDays,
  offDaysType,
  offDaysText
}: {
  offDays: number[];
  offDaysType: string;
  offDaysText: string;
}) {
  return (
    <section className="panel" style={{ cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Weekly Off-Days Policy</h2>
        <span style={{ color: "#60a5fa" }}>Active: {offDaysText || "None"}</span>
      </div>
      <p className="muted">
        Employees without scans on off-days are marked as <strong>WEEKEND</strong> instead of{" "}
        <strong>ABSENT</strong>.
      </p>
      <form
        action={updateWeeklyOffDays}
        style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 20 }}
      >
        {policies.map((policy) => (
          <PolicyOption key={policy.value} policy={policy} selected={offDaysType} />
        ))}
        <CustomPolicy offDays={offDays} selected={offDaysType} />
        <button type="submit" className="primary-btn">
          Save Workday Policy
        </button>
      </form>
    </section>
  );
}
