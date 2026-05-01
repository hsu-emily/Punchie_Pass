import React from 'react';

/**
 * Layout component that applies a pink-to-white radial gradient background
 * and centers its children. Use this to wrap all pages for a consistent look.
 *
 * Usage:
 * <Layout>
 *   <YourPageComponent />
 * </Layout>
 */
export default function Layout({ children }) {
  return (
    <div className="layout">
      <div className="layout-content">
        {children}
      </div>
    </div>
  );
} 