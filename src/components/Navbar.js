import React from 'react';

const ZapIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>);

const Navbar = ({ onNavigate }) => (
    <nav className="navbar">
        <div className="nav-content">
            <div className="nav-brand" onClick={() => onNavigate('main')}>
                <ZapIcon className="header-icon" />
                <span>InnoVision</span>
            </div>
        </div>
    </nav>
);

export default Navbar;