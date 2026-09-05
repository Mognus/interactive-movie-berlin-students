import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// Full level: nothing else is audible while a board is up.
const VOLUME = 1;
const FADE_MS = 320;
const FADE_TICK_MS = 20;

interface AmbienceProps {
    // Bed for the current board. Always set, never undefined: the element needs
    // something loadable from the very first render so the start gesture has
    // something to unlock (see Player for the same constraint).
    src: string;
    playing: boolean;
}

// The soundtrack under the board. A single long-lived <audio> for the whole
// session, for the same reason the Player keeps one <video>: iOS grants
// playback permission per element and only from a real user gesture.
export const Ambience = forwardRef<HTMLAudioElement, AmbienceProps>(
    function Ambience({ src, playing }, ref) {
        const audioRef = useRef<HTMLAudioElement>(null);
        useImperativeHandle(ref, () => audioRef.current!, []);
        const fade = useRef<number | undefined>(undefined);

        // Loading is separate from playing, so the bed is buffered by the time
        // the clip in front of it ends.
        useEffect(() => {
            const audio = audioRef.current;
            if (audio) audio.src = src;
        }, [src]);

        useEffect(() => {
            const audio = audioRef.current;
            if (!audio) return;

            // Ramp rather than cut: without this the bed and the film's own
            // soundtrack collide hard on every board/clip transition.
            const rampTo = (target: number, done?: () => void) => {
                clearInterval(fade.current);
                const from = audio.volume;
                const startedAt = Date.now();
                fade.current = window.setInterval(() => {
                    const t = Math.min((Date.now() - startedAt) / FADE_MS, 1);
                    audio.volume = from + (target - from) * t;
                    if (t === 1) {
                        clearInterval(fade.current);
                        done?.();
                    }
                }, FADE_TICK_MS);
            };

            if (!playing) {
                rampTo(0, () => audio.pause());
            } else {
                // The voice overs are one-shot narration, not a loop, so each
                // board visit starts its bed from the top and then runs out.
                audio.currentTime = 0;
                audio.volume = 0;
                // A blocked bed is not worth interrupting the film for: the
                // clips carry the browser's playback permission either way.
                audio.play().catch(() => {});
                rampTo(VOLUME);
            }

            return () => clearInterval(fade.current);
        }, [src, playing]);

        return <audio ref={audioRef} preload="auto" hidden />;
    },
);
