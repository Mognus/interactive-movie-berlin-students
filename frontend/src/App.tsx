import { useState } from "react";
import { graph, nodeOf, step } from "./engine/engine";
import { Player } from "./components/Player";
import { Board } from "./components/Board";
import "./App.css";

function App() {
  // browsers block un-muted autoplay without a user gesture, so the film starts behind a click
  const [started, setStarted] = useState(false);
  const [nodeId, setNodeId] = useState(graph.start);
  const [boardVisited, setBoardVisited] = useState(false);

  if (!started) {
    return (
      <div className="screen">
        <h1>A Crime No One Saw Coming</h1>
        <button className="solve" onClick={() => setStarted(true)}>
          Start
        </button>
      </div>
    );
  }

  const node = nodeOf(nodeId);

  switch (node.type) {
    case "clip":
      return (
        // key remounts the <video> per clip so autoPlay fires again
        <Player key={nodeId} src={node.src!} onEnded={() => setNodeId(step(nodeId))} />
      );
    case "board":
      return (
        <Board
          attributes={graph.attributes}
          auto={boardVisited ? undefined : node.firstVisitAuto}
          onSubmit={(sel) => {
            setBoardVisited(true);
            setNodeId(step(nodeId, sel));
          }}
        />
      );
    case "end":
      return (
        <div className="screen">
          <h1>Ende</h1>
          <p>Der Fall ist gelöst.</p>
        </div>
      );
  }
}

export default App;
