import React from 'react';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      &copy; {new Date().getFullYear()} Ever After
    </footer>
  );
}
