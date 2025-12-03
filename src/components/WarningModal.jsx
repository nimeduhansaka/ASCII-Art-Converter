import React from 'react';

const WarningModal = ({ showWarning, setShowWarning, setUseRealColors }) => {
    if (!showWarning) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-neutral-900 rounded-lg p-8 max-w-sm text-center border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4 font-dmSans">Performance Warning</h3>
                <p className="text-neutral-400 mb-6 font-dmSans">
                    "Real Colors" mode can be slow and cause lag, especially with the live camera. Do you want to proceed?
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setShowWarning(false)}
                        className="btn-minimal px-6 py-2 font-semibold rounded font-dmSans"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            setUseRealColors(true);
                            setShowWarning(false);
                        }}
                        className="btn-minimal px-6 py-2 bg-white text-black font-semibold rounded hover:bg-neutral-200 font-dmSans"
                    >
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WarningModal;
