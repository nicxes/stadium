import React, { useState } from 'react';

const Changelog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOverlay = () => {
    setIsOpen(!isOpen);
    document.querySelector('body').classList.toggle('overlay');
  };

  return (
    <>
      <button
        onClick={toggleOverlay}
        className="changelog-trigger"
        type="button"
      >
        CHANGELOG
      </button>

      {isOpen && (
        <div className="changelog-overlay">
          <div className="changelog-content">
            <button
              type="button"
              onClick={toggleOverlay}
              className="changelog-close"
            >
              ×
            </button>
            <h3 className="changelog-title">Changelog</h3>
            <p className="changelog-date">29th April 2025</p>
            <ul className="changelog-list">
              <li>Added icons for Mei, Reaper, Ana, Mercy, and Moira</li>
              <li>Added tooltip for character stat bars</li>
              <li>Made item icons bigger on desktop</li>
              <li>Added a changelog</li>
              <li>Added build name text box</li>
              <li>Added button to toggle hiding characters (hides by default if viewing a shared build)</li>
              <li>Restructured share URL to be shorter and more concise. Old builds are still supported!</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Changelog;
