export default function AboutPage({ onClose }) {
  return (
    <div className="about-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <div className="about-header">
          <h2>About Flood Plain Explorer</h2>
          <button className="detail-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="about-content">
          <section>
            <h3>What is this tool?</h3>
            <p>
              Flood Plain Explorer is an interactive map application that visualizes the
              0.2% annual chance (500-year) flood plain across the United States and shows
              what buildings are located within those flood zones. It helps communities,
              planners, and individuals understand flood risk exposure.
            </p>
          </section>

          <section>
            <h3>Data Sources</h3>
            <div className="about-sources">
              <div className="about-source">
                <h4>FEMA National Flood Hazard Layer (NFHL)</h4>
                <p>
                  Flood zone boundaries are sourced from FEMA&apos;s National Flood Hazard
                  Layer, served via Esri&apos;s ArcGIS Online. This data represents the
                  0.2% annual chance flood zone (Zone X with &ldquo;0.2 PCT ANNUAL CHANCE
                  FLOOD HAZARD&rdquo; subtype).
                </p>
              </div>
              <div className="about-source">
                <h4>USACE National Structure Inventory (NSI)</h4>
                <p>
                  Building data comes from the U.S. Army Corps of Engineers&apos; National
                  Structure Inventory, which provides point-level data on structures
                  nationwide including occupancy type, estimated values, foundation type,
                  and population estimates.
                </p>
              </div>
              <div className="about-source">
                <h4>Basemap</h4>
                <p>
                  CARTO Dark Matter basemap tiles, powered by OpenStreetMap data.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3>How to Use</h3>
            <ol>
              <li>Search for a location using the search bar, or pan/zoom the map</li>
              <li>Zoom in to street level (zoom 14+) to load flood and building data</li>
              <li>Orange highlighted areas show the 0.2% annual chance flood zone</li>
              <li>Colored dots represent buildings within the flood zone</li>
              <li>Click a building on the map or in the sidebar list for details</li>
              <li>Use filters to narrow down buildings by type, value, or stories</li>
              <li>Share the current view by copying the URL</li>
            </ol>
          </section>

          <section>
            <h3>Limitations</h3>
            <ul>
              <li>
                Flood zone boundaries are based on FEMA&apos;s current effective maps and
                may not reflect recent changes in flood risk
              </li>
              <li>
                Building data from the NSI is modeled and may not reflect actual on-the-ground
                conditions
              </li>
              <li>
                Population estimates are statistical and do not represent actual residents
              </li>
              <li>
                This tool is for informational purposes only and should not be used as the
                sole basis for insurance, planning, or investment decisions
              </li>
            </ul>
          </section>

          <section className="about-footer-section">
            <p>
              Built with React, MapLibre GL JS, and open government data.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
