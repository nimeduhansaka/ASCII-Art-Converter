import React from 'react';

const Preloader = ({ isLoading }) => {
    if (!isLoading) return null;

    return (
        <div className="flex justify-center items-center m-8">
            <div className="ai-matrix-loader">
                <div className="digit">0</div>
                <div className="digit">1</div>
                <div className="digit">0</div>
                <div className="digit">1</div>
                <div className="digit">1</div>
                <div className="digit">0</div>
                <div className="digit">0</div>
                <div className="digit">1</div>
                <div className="glow"></div>
            </div>
        </div>
    );
};

export default Preloader;
