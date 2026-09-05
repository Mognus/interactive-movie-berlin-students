import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

interface PlayerProps {
    // undefined while a board is showing: the element then keeps the previous
    // clip loaded instead of tearing its source down
    src?: string;
    visible: boolean;
    onEnded: () => void;
    onBlocked: () => void;
}

// Fullscreen clip playback. Deliberately one long-lived <video> for the whole
// session rather than one per clip: iOS grants playback permission per element
// and only from a real user gesture, so a freshly mounted element would be
// blocked from the second clip onwards. The parent unlocks this one inside the
// start click and it stays authorised from then on.
export const Player = forwardRef<HTMLVideoElement, PlayerProps>(
    function Player({ src, visible, onEnded, onBlocked }, ref) {
        const videoRef = useRef<HTMLVideoElement>(null);
        useImperativeHandle(ref, () => videoRef.current!, []);

        // Loading is separate from playing so the first clip is already buffered
        // by the time the start button is pressed.
        useEffect(() => {
            const video = videoRef.current;
            if (video && src) video.src = src;
        }, [src]);

        useEffect(() => {
            const video = videoRef.current;
            if (!video) return;

            if (!visible) {
                // Nothing else stops this element - it outlives every clip, and
                // a clip used to only ever be left by ending on its own. Leaving
                // one early (dev skip) would otherwise keep the audio running
                // under the board. Rewinding matters too: a clip the story
                // reaches twice keeps the same src, so without this it would
                // resume from wherever it was cut off.
                video.pause();
                video.currentTime = 0;
                return;
            }

            // resolves immediately when the click handler already started it
            video.play().catch(onBlocked);
        }, [src, visible, onBlocked]);

        return (
            <video
                ref={videoRef}
                className="player"
                playsInline
                hidden={!visible}
                onEnded={onEnded}
            />
        );
    },
);
