import React from 'react';

const MatrixBackground = ({ showPreloader }) => {
    return (
        <div className={`matrix-container ${!showPreloader ? 'hidden' : ''}`}>
            <div className="matrix-pattern">
                {Array.from({length: 40}).map((_, i) => <div className="matrix-column" key={i}></div>)}
            </div>
            <div className="matrix-pattern">
                {Array.from({length: 40}).map((_, i) => <div className="matrix-column" key={i}></div>)}
            </div>
            <div className="matrix-pattern">
                {Array.from({length: 40}).map((_, i) => <div className="matrix-column" key={i}></div>)}
            </div>
            <div className="matrix-pattern">
                {Array.from({length: 40}).map((_, i) => <div className="matrix-column" key={i}></div>)}
            </div>
            <div className="matrix-pattern">
                {Array.from({length: 40}).map((_, i) => <div className="matrix-column" key={i}></div>)}
            </div>
        </div>
    );
};

export default MatrixBackground;
