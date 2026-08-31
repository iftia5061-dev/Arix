import './Stats.css'

const stats = [
  { number: '25+', label: 'Products' },
  { number: '150+', label: 'Projects Delivered' },
  { number: '40+', label: 'Happy Clients' },
  { number: '5+', label: 'Years of Experience' },
]

function Stats() {
  return (
    <section className="stats">
      <div className="stats-container fade-up-stagger">
        {stats.map((stat, index) => (
          <div className="stat-item" key={index}>
            <h3 className="stat-number">{stat.number}</h3>
            <p className="stat-label">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Stats