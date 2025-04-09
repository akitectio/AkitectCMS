import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer bg-white border-top py-3 mt-auto">
      <div className="container-fluid text-center">
        <span className="text-muted">
          &copy; {new Date().getFullYear()} AkitectCMS. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;