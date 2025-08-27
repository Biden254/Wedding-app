import React from 'react';

export default function Header() {
  return (
    <header className="header" role="banner">
      <div className="brand">Ever After</div>
      <nav className="top-nav" role="navigation" aria-label="main">
        <a href="#details">Details</a>
        <a href="#rsvp">RSVP</a>
        <a href="#registry">Registry</a>
        <a href="#photos">Photos</a>
      </nav>
    </header>
  );
}
