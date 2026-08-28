import './About.css'

function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <h1 className="about-hero-title">About Orofex</h1>
        <p className="about-hero-subtitle">
          We're a team of builders creating software, SaaS, AI, and mobile products that help businesses grow.
        </p>
      </section>

      <section className="about-mission-vision">
        <div className="about-mv-card">
          <span className="about-mv-icon">🎯</span>
          <h2>Our Mission</h2>
          <p>
            To empower businesses of every size with reliable, scalable digital products that solve real problems and drive measurable growth.
          </p>
        </div>

        <div className="about-mv-card">
          <span className="about-mv-icon">🔭</span>
          <h2>Our Vision</h2>
          <p>
            To become a trusted digital partner for companies worldwide, known for quality, innovation, and long-term reliability.
          </p>
        </div>
      </section>

      <section className="about-technology">
        <div className="about-technology-container">
          <h2>Our Technology</h2>
          <p className="about-technology-subtitle">
            We build with modern, proven technologies to deliver fast, secure, and scalable products.
          </p>

          <div className="tech-tags">
            <span className="tech-tag">React</span>
            <span className="tech-tag">Node.js</span>
            <span className="tech-tag">Python</span>
            <span className="tech-tag">AI / ML</span>
            <span className="tech-tag">Cloud Infrastructure</span>
            <span className="tech-tag">REST & GraphQL APIs</span>
            <span className="tech-tag">React Native</span>
            <span className="tech-tag">PostgreSQL</span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About