import React from 'react';
import PublicHeader from './PublicHeader';
import Footer from './Footer';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      <PublicHeader />
      <main className="pt-16 lg:pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
