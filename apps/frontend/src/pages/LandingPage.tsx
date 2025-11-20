import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Announcement Banner */}
      <div className="announcement-banner">
        <div className="container">
          <p>
            🎉 Now tracking mentions across 4 major AI platforms
            <a href="#features" className="ml-2 underline hover:text-white">
              Learn more →
            </a>
          </p>
        </div>
      </div>

      {/* Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            {/* Logo */}
            <div className="logo">
              <div className="logo-icon">
                <svg viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="4" width="24" height="24" rx="6" fill="url(#logo-gradient)" />
                  <path d="M12 10h8v2h-8zM12 16h8v2h-8zM12 22h5v2h-5z" fill="white" />
                  <defs>
                    <linearGradient id="logo-gradient" x1="4" y1="4" x2="28" y2="28">
                      <stop offset="0%" stopColor="#A65CFF" />
                      <stop offset="50%" stopColor="#FF6FAF" />
                      <stop offset="100%" stopColor="#4F8BFF" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="logo-text">AI Mention Tracker</span>
            </div>

            {/* Navigation */}
            <nav className="nav">
              <a href="#product">Product</a>
              <a href="#customers">Customers</a>
              <a href="#company">Company</a>
              <a href="#pricing">Pricing</a>
              <a href="#changelog">Changelog</a>
            </nav>

            {/* Actions */}
            <div className="header-actions">
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Transform AI mentions into{' '}
                <span className="gradient-text">brand growth</span>
              </h1>
              <p className="hero-subtitle">
                Monitor your brand mentions across ChatGPT, Claude, Gemini, and Perplexity
                in real-time. Get instant alerts, track competitors, and analyze sentiment
                with our unified AI tracking platform.
              </p>

              <div className="hero-cta">
                <Link to="/register" className="btn-primary btn-glow">
                  Get Started Free
                </Link>
                <a href="#features" className="btn-secondary">
                  Learn more ↓
                </a>
              </div>

              {/* Trusted By */}
              <div className="trusted-by">
                <p className="trusted-label">Trusted by leading companies</p>
                <div className="trusted-logos">
                  <div className="logo-item">Canva</div>
                  <div className="logo-item">Loom</div>
                  <div className="logo-item">Linear</div>
                  <div className="logo-item">Notion</div>
                  <div className="logo-item">Vercel</div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hero-visual">
              <div className="visual-container">
                {/* Central AI Icon */}
                <div className="ai-core">
                  <div className="ai-icon">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="url(#ai-gradient)" opacity="0.2" />
                      <circle cx="50" cy="50" r="30" fill="url(#ai-gradient)" opacity="0.4" />
                      <circle cx="50" cy="50" r="20" fill="url(#ai-gradient)" />
                      <defs>
                        <linearGradient id="ai-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#A65CFF" />
                          <stop offset="50%" stopColor="#FF6FAF" />
                          <stop offset="100%" stopColor="#4F8BFF" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* Platform Icons */}
                <div className="platform-icon platform-1">
                  <div className="icon-circle">GPT</div>
                </div>
                <div className="platform-icon platform-2">
                  <div className="icon-circle">Claude</div>
                </div>
                <div className="platform-icon platform-3">
                  <div className="icon-circle">Gemini</div>
                </div>
                <div className="platform-icon platform-4">
                  <div className="icon-circle">Perplexity</div>
                </div>

                {/* Analytics Chart */}
                <div className="analytics-chart">
                  <div className="chart-header">
                    <span>Mention Trends</span>
                    <span className="chart-value">+24%</span>
                  </div>
                  <div className="chart-bars">
                    <div className="bar" style={{ height: '40%' }}></div>
                    <div className="bar" style={{ height: '60%' }}></div>
                    <div className="bar" style={{ height: '45%' }}></div>
                    <div className="bar" style={{ height: '80%' }}></div>
                    <div className="bar" style={{ height: '65%' }}></div>
                    <div className="bar" style={{ height: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Block 1 - Centralize */}
      <section id="features" className="feature-section">
        <div className="container">
          <div className="feature-content">
            <div className="feature-visual">
              <div className="feature-card">
                <div className="card-header">
                  <h3>Dashboard Overview</h3>
                  <span className="status-badge">Live</span>
                </div>
                <div className="card-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Mentions</span>
                    <span className="stat-value gradient-text">1,247</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Mention Rate</span>
                    <span className="stat-value">87.3%</span>
                  </div>
                </div>
                <div className="donut-chart">
                  <svg viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#1a1a2e" strokeWidth="20" />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="url(#donut-gradient)"
                      strokeWidth="20"
                      strokeDasharray="440 502"
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                    />
                    <defs>
                      <linearGradient id="donut-gradient">
                        <stop offset="0%" stopColor="#A65CFF" />
                        <stop offset="50%" stopColor="#FF6FAF" />
                        <stop offset="100%" stopColor="#4F8BFF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="donut-label">
                    <span className="donut-value">87%</span>
                    <span className="donut-text">Coverage</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-text">
              <h2 className="feature-title">Centralize</h2>
              <p className="feature-subtitle">
                Consolidate and organize AI mentions in hours, not days
              </p>
              <ul className="feature-list">
                <li>
                  <div className="list-icon">✓</div>
                  <div className="list-content">
                    <strong>Unified data intake</strong>
                    <p>Automatically collect mentions from ChatGPT, Claude, Gemini, and Perplexity</p>
                  </div>
                </li>
                <li>
                  <div className="list-icon">✓</div>
                  <div className="list-content">
                    <strong>Automatic categorization</strong>
                    <p>Smart tagging and sentiment analysis powered by AI</p>
                  </div>
                </li>
                <li>
                  <div className="list-icon">✓</div>
                  <div className="list-content">
                    <strong>Consistent taxonomy</strong>
                    <p>Standardized tracking across all AI platforms</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Block 2 - Discover */}
      <section className="feature-section feature-reverse">
        <div className="container">
          <div className="feature-content">
            <div className="feature-text">
              <h2 className="feature-title">Discover</h2>
              <p className="feature-subtitle">Surface the insights that matter</p>
              <ul className="feature-list">
                <li>
                  <div className="list-icon">✓</div>
                  <div className="list-content">
                    <strong>Trend analysis</strong>
                    <p>Identify patterns and shifts in brand perception over time</p>
                  </div>
                </li>
                <li>
                  <div className="list-icon">✓</div>
                  <div className="list-content">
                    <strong>Competitor tracking</strong>
                    <p>Benchmark your brand against competitors in AI responses</p>
                  </div>
                </li>
                <li>
                  <div className="list-icon">✓</div>
                  <div className="list-content">
                    <strong>Real-time alerts</strong>
                    <p>Get notified instantly when your brand is mentioned</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="feature-visual">
              <div className="feature-card">
                <div className="card-header">
                  <h3>Insight Trends</h3>
                </div>
                <div className="trend-chart">
                  <svg viewBox="0 0 400 200" className="line-chart">
                    <defs>
                      <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#A65CFF" />
                        <stop offset="50%" stopColor="#FF6FAF" />
                        <stop offset="100%" stopColor="#4F8BFF" />
                      </linearGradient>
                      <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#A65CFF" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#A65CFF" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 150 L 60 130 L 120 100 L 180 110 L 240 70 L 300 50 L 360 30 L 400 10"
                      fill="none"
                      stroke="url(#line-gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 0 150 L 60 130 L 120 100 L 180 110 L 240 70 L 300 50 L 360 30 L 400 10 L 400 200 L 0 200 Z"
                      fill="url(#area-gradient)"
                    />
                  </svg>
                </div>
                <div className="keyword-tags">
                  <span className="tag">Brand Recognition</span>
                  <span className="tag">Product Quality</span>
                  <span className="tag">Innovation</span>
                  <span className="tag">Customer Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to track your AI presence?</h2>
            <p className="cta-subtitle">
              Join leading brands monitoring their mentions across AI platforms
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-primary btn-glow btn-large">
                Start Free Trial
              </Link>
              <Link to="/demo" className="btn-secondary btn-large">
                Book a Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#integrations">Integrations</a></li>
                <li><a href="#changelog">Changelog</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Resources</h4>
              <ul>
                <li><a href="#docs">Documentation</a></li>
                <li><a href="#api">API Reference</a></li>
                <li><a href="#support">Support</a></li>
                <li><a href="#status">Status</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#privacy">Privacy</a></li>
                <li><a href="#terms">Terms</a></li>
                <li><a href="#security">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 AI Mention Tracker. All rights reserved.</p>
            <div className="social-links">
              <a href="#twitter">Twitter</a>
              <a href="#linkedin">LinkedIn</a>
              <a href="#github">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
