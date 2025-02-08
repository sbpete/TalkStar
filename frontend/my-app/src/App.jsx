import React, { useState, useRef } from "react";
import TranscriptChat from "./components/TranscriptChat.jsx";
import SuggestionBox from "./components/SuggestionBox.jsx";
import InsightsDashboard from "./components/InsightsDashboard.jsx";
import "./App.css";

function App() {
  const [rightSplitPosition, setRightSplitPosition] = useState(50);
  const isDraggingRef = useRef(false);
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const mouseY = e.clientY - containerRect.top;

    // Calculate percentage
    let percentage = (mouseY / containerHeight) * 100;

    // Constrain between 20% and 80%
    percentage = Math.max(20, Math.min(80, percentage));

    setRightSplitPosition(percentage);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className="h-screen w-screen flex bg-gray-900">
      {/* Left half */}
      <div className="w-1/2 bg-gray-900 p-4">
        <div className="h-full bg-gray-800 rounded-lg shadow-sm p-4">
          <TranscriptChat />
        </div>
      </div>

      {/* Right half */}
      <div ref={containerRef} className="w-1/2 relative bg-gray-200">
        {/* Top section */}
        <div
          className="absolute top-0 left-0 right-0 bg-gray-800 p-4 overflow-y-auto"
          style={{ height: `${rightSplitPosition}%` }}
        >
          <SuggestionBox />
        </div>

        {/* Draggable divider */}
        <div
          className="absolute left-0 right-0 h-2 bg-gray-700 cursor-ns-resize hover:bg-blue-400 transition-colors"
          style={{ top: `${rightSplitPosition}%`, marginTop: "-4px" }}
          onMouseDown={handleMouseDown}
        />

        {/* Bottom section */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gray-800 p-4 overflow-y-auto"
          style={{ height: `${100 - rightSplitPosition}%` }}
        >
          <InsightsDashboard />
        </div>
      </div>
    </div>
  );
}

export default App;
