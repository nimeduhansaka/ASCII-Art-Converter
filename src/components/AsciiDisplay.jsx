import React from 'react';

const AsciiDisplay = ({ asciiArt, imageSrc, isCameraOn, handleDownload, useRealColors }) => {
    return (
        <div className="transition-opacity duration-500">
            <div className="flex items-center justify-center mb-4 gap-4">
                <h2 className="text-2xl font-semibold text-white font-urbanist">ASCII Art</h2>
                {asciiArt && imageSrc && !isCameraOn && (
                    <button
                        onClick={handleDownload}
                        className="btn-minimal px-3 py-1 text-xs font-bold uppercase tracking-wider rounded"
                    >
                        Download JPG
                    </button>
                )}
            </div>
            <div className="bg-black p-4 rounded-lg border border-white/10 overflow-auto max-h-96">
                {useRealColors ? (
                    <pre
                        className="font-mono text-center whitespace-pre leading-none"
                        dangerouslySetInnerHTML={{ __html: asciiArt }}
                        style={{ fontSize: '1px' }}
                    />
                ) : (
                    <pre
                        className="font-mono text-center whitespace-pre text-white"
                        style={{
                            fontSize: isCameraOn ? '6px' : '2px',
                            lineHeight: isCameraOn ? '5px' : '2px',
                        }}
                    >
                        {asciiArt || ' '}
                    </pre>
                )}
            </div>
        </div>
    );
};

export default AsciiDisplay;
