import React from 'react';

const ImagePreview = ({ isCameraOn, imageSrc, videoRef }) => {
    return (
        <div className="transition-opacity duration-500">
            <h2 className="text-2xl font-semibold mb-4 text-center text-white font-urbanist">
                {isCameraOn ? 'Camera Feed' : 'Original Image'}
            </h2>
            <div className="bg-neutral-900/50 p-4 rounded-lg border border-white/10 min-h-[300px] flex items-center justify-center">
                {!imageSrc && !isCameraOn && (
                    <div className="text-center text-neutral-500 font-dmSans">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            fill="currentColor"
                            className="bi bi-image mx-auto mb-4 opacity-50"
                            viewBox="0 0 16 16"
                        >
                            <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                            <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" />
                        </svg>
                        <p className="font-dmSans text-sm">Image or camera feed</p>
                    </div>
                )}
                {imageSrc && !isCameraOn && (
                    <img
                        src={imageSrc}
                        alt="Uploaded preview"
                        className="max-w-full max-h-96 h-auto rounded-lg"
                    />
                )}
                <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className={`max-w-full max-h-96 h-auto rounded-lg ${isCameraOn ? 'block' : 'hidden'}`}
                ></video>
            </div>
        </div>
    );
};

export default ImagePreview;
