import React from 'react';

const Controls = ({
    fileInputRef,
    handleImageChange,
    handleUploadClick,
    isLoading,
    isCameraOn,
    startCamera,
    stopCamera,
    useRealColors,
    handleColorModeToggle,
    error,
    showPreloader
}) => {
    return (
        <div className={`p-6 sm:p-8 text-center ${!showPreloader ? 'animate-popup delay-2' : 'opacity-0'}`}>
            <div className="flex justify-center items-center gap-4 flex-wrap">
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                />

                <button
                    onClick={handleUploadClick}
                    disabled={isLoading}
                    className="btn-minimal px-6 py-3 font-dmSans rounded-lg focus:outline-none"
                >
                    {isLoading ? 'Processing...' : 'Upload Image'}
                </button>

                {!isCameraOn ? (
                    <button
                        onClick={startCamera}
                        className="btn-minimal px-6 py-3 font-dmSans rounded-lg focus:outline-none"
                    >
                        Use Camera
                    </button>
                ) : (
                    <button
                        onClick={stopCamera}
                        className="btn-minimal px-6 py-3 border-red-500/50 text-red-400 font-dmSans rounded-lg hover:bg-red-500/10 focus:outline-none"
                    >
                        Stop Camera
                    </button>
                )}
            </div>
            <div className="flex items-center justify-center mt-6 gap-3 font-dmSans">
                <span className={`text-sm font-medium transition-colors ${!useRealColors ? 'text-white' : 'text-neutral-500'}`}>
                    Simple
                </span>

                <button
                    onClick={handleColorModeToggle}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${useRealColors ? 'bg-white' : 'bg-neutral-700'}`}
                    role="switch"
                    aria-checked={useRealColors}
                >
                    <span
                        aria-hidden="true"
                        className={`inline-block h-5 w-5 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${useRealColors ? 'translate-x-5 bg-black' : 'translate-x-0 bg-white'}`}
                    />
                </button>

                <span className={`text-sm font-medium transition-colors ${useRealColors ? 'text-white' : 'text-neutral-500'}`}>
                    Real Colors
                </span>
            </div>
            {error && <p className="text-red-400 mt-4 font-dmSans">{error}</p>}
        </div>
    );
};

export default Controls;
