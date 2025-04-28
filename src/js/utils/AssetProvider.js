import React, {
  createContext, useContext, useState, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import JSZip from 'jszip';

// Create context
const AssetContext = createContext(null);

// Custom hook to use assets
export const useAssets = () => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
};

export const AssetProvider = ({ children, zipPath }) => {
  const [assets, setAssets] = useState(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(zipPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch ZIP: ${response.status}`);
        }

        const zipBlob = await response.blob();
        const zip = new JSZip();
        const contents = await zip.loadAsync(zipBlob);

        const newAssets = new Map();

        // Process all files in parallel
        await Promise.all(
          Object.keys(contents.files).map(async (filename) => {
            const file = contents.files[filename];
            if (!file.dir) {
              const blob = await file.async('blob');
              const url = URL.createObjectURL(blob);
              newAssets.set(filename, {
                url,
                type: blob.type,
                size: blob.size,
              });
            }
          }),
        );

        setAssets(newAssets);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading assets:', err);
        setError(err);
        setIsLoading(false);
      }
    };

    loadAssets();

    // Cleanup function to revoke object URLs
    return () => {
      assets.forEach((asset) => {
        if (asset.url) {
          URL.revokeObjectURL(asset.url);
        }
      });
    };
  }, [zipPath]);

  // Helper function to get asset by filename
  const getAsset = (filename) => assets.get(filename);

  // Helper function to get all assets
  const getAllAssets = () => Array.from(assets.entries());

  const value = React.useMemo(() => ({
    isLoading,
    error,
    getAsset,
    getAllAssets,
    assetCount: assets.size,
  }), [isLoading, error, assets]);

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  );
};

AssetProvider.propTypes = {
  children: PropTypes.node.isRequired,
  zipPath: PropTypes.string.isRequired,
};
