import { useState } from 'react';

export default function EducationalPanel() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="educational-panel">
      <div className="edu-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h4>What is a 0.2% Flood Plain?</h4>
        <span className={`filter-chevron ${isExpanded ? 'open' : ''}`}>&#9660;</span>
      </div>

      {isExpanded && (
        <div className="edu-content">
          <p>
            The <strong>0.2% annual chance flood zone</strong> (also called the
            &ldquo;500-year flood plain&rdquo;) represents areas with a 0.2% probability
            of flooding in any given year.
          </p>

          <div className="edu-stat-grid">
            <div className="edu-stat">
              <span className="edu-stat-value">0.2%</span>
              <span className="edu-stat-label">Annual Chance</span>
            </div>
            <div className="edu-stat">
              <span className="edu-stat-value">26%</span>
              <span className="edu-stat-label">Chance Over 30-Year Mortgage</span>
            </div>
            <div className="edu-stat">
              <span className="edu-stat-value">500 yr</span>
              <span className="edu-stat-label">Average Return Period</span>
            </div>
          </div>

          <h5>Common Misconceptions</h5>
          <ul>
            <li>
              <strong>&ldquo;It only floods once every 500 years&rdquo;</strong> &mdash; False.
              A 500-year flood can happen in consecutive years. The term describes probability,
              not a schedule.
            </li>
            <li>
              <strong>&ldquo;I don&apos;t need flood insurance outside the 1% zone&rdquo;</strong>
              &mdash; Over 25% of flood insurance claims come from outside high-risk zones.
              The 0.2% zone still carries meaningful risk.
            </li>
            <li>
              <strong>&ldquo;My area has never flooded&rdquo;</strong> &mdash; Climate change,
              development, and aging infrastructure continually alter flood risk. Past experience
              does not predict future flooding.
            </li>
          </ul>

          <h5>Why This Matters</h5>
          <p>
            Understanding what structures are in the 0.2% flood plain helps communities
            plan for resilience. Even though these areas have a lower annual probability than
            the 1% (100-year) zone, the cumulative risk over the lifetime of a building is
            significant. Properties in the 0.2% zone are often not required to carry flood
            insurance, leaving owners financially vulnerable when flooding does occur.
          </p>

          <div className="edu-source">
            Data: FEMA National Flood Hazard Layer &amp; USACE National Structure Inventory
          </div>
        </div>
      )}
    </div>
  );
}
