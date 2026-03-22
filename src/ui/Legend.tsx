const items = [
  { color: '#4cf0a0', label: 'Active' },
  { color: '#4cc9f0', label: 'Completed' },
  { color: '#f0a04c', label: 'Archived' },
  { color: '#e040fb', label: 'Hackathon' },
]

export function Legend() {
  return (
    <div className="legend">
      {items.map((item) => (
        <div key={item.label} className="legend-item">
          <span className="legend-dot" style={{ background: item.color }} />
          <span className="legend-label">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
