import React from 'react';

const Header = ({ showPreloader }) => {
    return (
        <header className={`text-center mb-8 ${!showPreloader ? 'animate-popup delay-1' : 'opacity-0'}`}>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-orbitron">
                ASCII Art Converter
            </h1>
            <p className="text-neutral-400 mt-2 text-lg font-bold font-space-mono">
                Upload an image or use your camera for a real-time conversion.
            </p>
        </header>
    );
};

export default Header;
