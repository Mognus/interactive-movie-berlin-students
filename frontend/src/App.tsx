import { useCallback, useRef, useState } from "react";
import { graph, mediaUrl, nodeOf, step } from "./engine/engine";
import { Player } from "./components/Player";
import { Ambience } from "./components/Ambience";
import { Board } from "./components/Board";
import "./App.css";

// Bed for every board that follows a clip without its own narration.
const BASELINE_VOICE_OVER = "/audio/vo-baseline.mp3";

// Testing aids: always on while developing, and switchable into a real build
// through VITE_DEV_TOOLS so the team can walk the story on the server without
// waiting out every clip. Off by default - the audience must not get these.
const DEV_TOOLS = import.meta.env.DEV || import.meta.env.VITE_DEV_TOOLS === "1";

// Mobile browsers hand the page a viewport that reaches under their own chrome,
// which is what made the player look mis-scaled. Fullscreen removes the chrome
// outright, and the orientation lock keeps a 16:9 film out of a portrait
// letterbox. Both are best effort: iPhone Safari offers neither, which is why
// the CSS fixes have to stand on their own and the rotate hint still exists.
async function enterFullscreen() {
    try {
        await document.documentElement.requestFullscreen?.({
            navigationUI: "hide",
        });
        await screen.orientation?.lock?.("landscape");
    } catch {
        // refused or unsupported - the layout works without it
    }
}

function App() {
    // browsers block un-muted autoplay without a user gesture, so the film starts behind a click
    const [started, setStarted] = useState(false);
    const [nodeId, setNodeId] = useState(graph.start);
    const [boardVisited, setBoardVisited] = useState(false);
    // set when the browser refuses play(); without this the clip would just sit
    // frozen on its first frame with nothing telling the audience why
    const [blocked, setBlocked] = useState(false);
    // The clip the board was entered from. This is what turns "after scene X"
    // in the script into something the board can act on - it picks the voice over.
    const [lastClip, setLastClip] = useState<string>();
    // Scenery the story has pinned onto the board, e.g. the Gertrudenlinde
    // drawing the detective turns up in OS_2_2_1_A. Grows, never shrinks.
    const [revealed, setRevealed] = useState<string[]>([]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const onBlocked = useCallback(() => setBlocked(true), []);

    const node = nodeOf(nodeId);
    const voiceOver =
        (lastClip && nodeOf(lastClip).voiceOver) || BASELINE_VOICE_OVER;

    // play() is called straight out of the click rather than left to an autoPlay
    // attribute: iOS only authorises the element when the call happens inside the
    // gesture itself, and that authorisation is what carries the later clips.
    const play = () => {
        setBlocked(false);
        videoRef.current?.play().catch(onBlocked);
    };

    const start = () => {
        // Unlock the bed on the same gesture, for the same per-element reason.
        // Starting and immediately pausing is enough to authorise it; the board
        // is still two clips away, so nothing is audible here.
        const audio = audioRef.current;
        audio?.play()
            .then(() => audio.pause())
            .catch(() => {});
        enterFullscreen();
        play();
        setStarted(true);
    };

    const onClipEnded = () => {
        if (node.revealsProp) {
            const prop = node.revealsProp;
            setRevealed((r) => (r.includes(prop) ? r : [...r, prop]));
        }
        setLastClip(nodeId);
        setNodeId(step(nodeId));
    };

    return (
        <>
            {/* both mounted for the whole session, see the comments in each */}
            <Player
                ref={videoRef}
                src={
                    node.type === "clip" && node.src
                        ? mediaUrl(node.src)
                        : undefined
                }
                visible={started && node.type === "clip"}
                onEnded={onClipEnded}
                onBlocked={onBlocked}
            />
            <Ambience
                ref={audioRef}
                src={mediaUrl(voiceOver)}
                playing={started && node.type === "board"}
            />

            {!started && (
                <div className="screen">
                    <h1>A Crime No One Saw Coming</h1>
                    <button className="solve" onClick={start}>
                        Start
                    </button>
                </div>
            )}

            {/* The clips run up to five minutes, so walking a path by hand is
                otherwise unbearable. Deliberately routed through onClipEnded
                rather than step() - a skip has to reveal props and arm the
                voice over exactly like a clip that ran out, or testing would
                prove nothing about the real playthrough. */}
            {DEV_TOOLS && started && node.type === "clip" && (
                <button
                    type="button"
                    className="dev-skip"
                    onClick={onClipEnded}
                    title="Testhilfe, nur bei aktivierten Dev-Tools sichtbar"
                >
                    Skip ▸ {nodeId}
                </button>
            )}

            {started && node.type === "board" && (
                <Board
                    attributes={graph.attributes}
                    auto={boardVisited ? undefined : node.firstVisitAuto}
                    revealed={revealed}
                    onSubmit={(sel) => {
                        setBoardVisited(true);
                        setNodeId(step(nodeId, sel));
                    }}
                />
            )}

            {started && node.type === "end" && (
                <div className="screen">
                    <h1>Ende</h1>
                    <p>Der Fall ist gelöst.</p>
                </div>
            )}

            {blocked && (
                <div className="screen tap-overlay">
                    <p>Wiedergabe wurde vom Browser blockiert.</p>
                    <button className="solve" onClick={play}>
                        Weiter
                    </button>
                </div>
            )}

            {/* CSS decides when this shows: portrait on a touch device */}
            <div className="rotate-hint">
                <p>Bitte das Gerät drehen.</p>
            </div>
        </>
    );
}

export default App;
