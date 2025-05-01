import React, { createRef, useState } from 'react';
import PropTypes from 'prop-types';
import { copyUrlToClipboard } from '../../utils/urlBuilder';
import gtagHelper from '../../utils/gtagHelper';

const ShareBuild = ({ character, buildName = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [buildCopied, setBuildCopied] = useState(false);
  const [oneTimeCopyEvent, setOneTimeCopyEvent] = useState(false);
  const inputRef = createRef(null);

  const toggleOverlay = () => {
    setIsOpen(!isOpen);
    gtagHelper('Open Share Build Overlay', {});
    document.querySelector('body').classList.toggle('overlay-open');
  };

  const handleCopyUrl = () => {
    copyUrlToClipboard();
    inputRef.current.select();

    if (!oneTimeCopyEvent) {
      setOneTimeCopyEvent(true);
      gtagHelper('Copy Build URL', {});
    }

    setBuildCopied(true);
    setTimeout(() => setBuildCopied(false), 2000);
  };

  const buildText = () => {
    let text = buildName || character;
    if (!text.toLowerCase().includes('build')) text = text.concat(' Build');
    return text;
  };

  return (
    <>
      <button
        type="button"
        className="col col-md-auto btn btn--primary"
        onClick={toggleOverlay}
      >
        Share Build
      </button>

      {isOpen && (
        <div className="overlay">
          <div className="share-build--content">
            <button
              type="button"
              onClick={toggleOverlay}
              className="overlay-close"
            >
              ×
            </button>
            <h5 className="share-build--title">Share your build</h5>
            <p className="share-build--description">
              Your <b>{buildText()}</b> can be accessed through this link. <b>You can also copy the link in your browser.</b>
            </p>
            <section className="share-build--url">
              <input
                type="text"
                className="share-build--url-input"
                value={window.location.href}
                ref={inputRef}
                readOnly
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="btn btn--primary"
              >
                Copy URL
              </button>
            </section>
            <p className={`share-build--copied ${buildCopied ? 'visible' : ''}`}>
              ✔ Build copied to clipboard!
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareBuild;

ShareBuild.propTypes = {
  character: PropTypes.string.isRequired,
  buildName: PropTypes.string,
};
