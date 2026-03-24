import { useState } from 'react';

export default function EducationalPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="educational-panel">
      <div className="edu-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h4>Understanding Flood Zones</h4>
        <span className={`filter-chevron ${isExpanded ? 'open' : ''}`}>&#9660;</span>
      </div>

      {isExpanded && (
        <div className="edu-content">
          <h5>1% Annual Chance (SFHA)</h5>
          <p>
            The <strong>Special Flood Hazard Area (SFHA)</strong> represents land with a
            1% probability of flooding in any given year &mdash; commonly called the
            &ldquo;100-year flood plain.&rdquo; Federally backed mortgages in this zone
            <strong> require flood insurance</strong>.
          </p>

          <div className="edu-stat-grid">
            <div className="edu-stat">
              <span className="edu-stat-value" style={{ color: '#2979ff' }}>1%</span>
              <span className="edu-stat-label">Annual Chance</span>
            </div>
            <div className="edu-stat">
              <span className="edu-stat-value" style={{ color: '#2979ff' }}>26%</span>
              <span className="edu-stat-label">Over 30-Year Mortgage</span>
            </div>
            <div className="edu-stat">
              <span className="edu-stat-value" style={{ color: '#2979ff' }}>100 yr</span>
              <span className="edu-stat-label">Return Period</span>
            </div>
          </div>

          <h5>0.2% Annual Chance</h5>
          <p>
            The <strong>0.2% annual chance flood zone</strong> (the &ldquo;500-year
            flood plain&rdquo;) has a lower but still meaningful probability.
            Flood insurance is <strong>not required</strong> but is recommended.
          </p>

          <div className="edu-stat-grid">
            <div className="edu-stat">
              <span className="edu-stat-value">0.2%</span>
              <span className="edu-stat-label">Annual Chance</span>
            </div>
            <div className="edu-stat">
              <span className="edu-stat-value">6%</span>
              <span className="edu-stat-label">Over 30-Year Mortgage</span>
            </div>
            <div className="edu-stat">
              <span className="edu-stat-value">500 yr</span>
              <span className="edu-stat-label">Return Period</span>
            </div>
          </div>

          <h5>Common Misconceptions</h5>
          <ul>
            <li>
              <strong>&ldquo;100-year flood means once per century&rdquo;</strong> &mdash; False.
              There is a 26% chance of a 1% flood occurring during a 30-year mortgage.
              These events can happen in consecutive years.
            </li>
            <li>
              <strong>&ldquo;I don&apos;t need insurance outside the SFHA&rdquo;</strong>
              &mdash; Over 25% of flood insurance claims come from outside high-risk zones.
            </li>
            <li>
              <strong>&ldquo;My area has never flooded&rdquo;</strong> &mdash; Climate change,
              development, and aging infrastructure continually alter flood risk.
            </li>
          </ul>

          <div className="edu-source">
            Data: FEMA National Flood Hazard Layer &amp; USACE National Structure Inventory
          </div>
        </div>
      )}
    </div>
  );
}
