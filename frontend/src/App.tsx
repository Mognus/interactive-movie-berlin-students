import { useCallback, useRef, useState } from "react";
import { graph, nodeOf, step } from "./engine/engine";
import { Player } from "./components/Player";
import { Board } from "./components/Board";
import "./App.css";

function App() {
    // browsers block un-muted autoplay without a user gesture, so the film starts behind a click
    const [started, setStarted] = useState(false);
    const [nodeId, setNodeId] = useState(graph.start);
    const [boardVisited, setBoardVisited] = useState(false);
    // set when the browser refuses play(); without this the clip would just sit
    // frozen on its first frame with nothing telling the audience why
    const [blocked, setBlocked] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const onBlocked = useCallback(() => setBlocked(true), []);

    const node = nodeOf(nodeId);

    // play() is called straight out of the click rather than left to an autoPlay
    // attribute: iOS only authorises the element when the call happens inside the
    // gesture itself, and that authorisation is what carries the later clips.
    const play = () => {
        setBlocked(false);
        videoRef.current?.play().catch(onBlocked);
    };

    return (
        <>
            {/* mounted for the whole session, hidden while a board is up */}
            <Player
                ref={videoRef}
                src={node.type === "clip" ? node.src : undefined}
                visible={started && node.type === "clip"}
                onEnded={() => setNodeId(step(nodeId))}
                onBlocked={onBlocked}
            />

            {!started && (
                <div className="screen">
                    <h1>A Crime No One Saw Coming</h1>
                    <button
                        className="solve"
                        onClick={() => {
                            play();
                            setStarted(true);
                        }}
                    >
                        Start
                    </button>
                </div>
            )}

            {started && node.type === "board" && (
                <Board
                    attributes={graph.attributes}
                    auto={boardVisited ? undefined : node.firstVisitAuto}
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
        </>
    );
}

export default App;
