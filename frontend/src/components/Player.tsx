// Fullscreen clip playback. The parent decides what happens when the clip ends.
export function Player({ src, onEnded }: { src: string; onEnded: () => void }) {
    return (
        <video
            className="player"
            src={src}
            autoPlay
            playsInline
            onEnded={onEnded}
        />
    );
}
