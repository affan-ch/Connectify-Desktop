import React from 'react';

const Loader = () => {
    return (
        <>
            <div className="loader-container">
                <div className="loader"></div>
            </div>
            <style jsx>{`
            .loader-container {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh; /* Full viewport height */
            }
            .loader {
            width: 32px;
            aspect-ratio: 1;
            --_g: no-repeat radial-gradient(farthest-side, #000 90%, #0000);
            background: var(--_g), var(--_g), var(--_g), var(--_g);
            background-size: 40% 40%;
            animation: l46 1s infinite;
            }

            @keyframes l46 {
            0% {
                background-position: 0 0, 100% 0, 100% 100%, 0 100%;
            }
            40%,
            50% {
                background-position: 100% 100%, 100% 0, 0 0, 0 100%;
            }
            90%,
            100% {
                background-position: 100% 100%, 0 100%, 0 0, 100% 0;
            }
            }
      `}</style>
        </>
    );
};

export default Loader;