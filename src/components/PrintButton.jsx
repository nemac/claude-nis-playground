import { useState } from 'react';

export default function PrintButton({ mapRef }) {
  const [showMenu, setShowMenu] = useState(false);

  function handleScreenshot() {
    const map = mapRef?.current;
    if (!map) return;
    try {
      const canvas = map.getCanvas();
      const link = document.createElement('a');
      link.download = `flood-plain-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Screenshot error:', err);
    }
    setShowMenu(false);
  }

  function handlePrint() {
    window.print();
    setShowMenu(false);
  }

  return (
    <div className="print-button-wrapper">
      <button
        className="header-btn"
        onClick={() => setShowMenu(!showMenu)}
        title="Export / Print"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path
            fillRule="evenodd"
            d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {showMenu && (
        <div className="print-menu">
          <button onClick={handleScreenshot}>Download Map Image</button>
          <button onClick={handlePrint}>Print Page</button>
        </div>
      )}
    </div>
  );
}
