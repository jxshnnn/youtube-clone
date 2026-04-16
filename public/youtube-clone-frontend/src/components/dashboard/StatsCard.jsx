export default function StatsCard({ icon, label, value, color = 'var(--brand)' }) {
  return (
    <div className="stats-card">
      <div className="stats-icon">{icon}</div>
      <div className="stats-value" style={{ color }}>{value ?? '—'}</div>
      <div className="stats-label">{label}</div>
    </div>
  );
}
