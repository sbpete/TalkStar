import React, { useState, useRef } from "react";
import TranscriptChat from "./components/TranscriptChat.jsx";
import SuggestionBox from "./components/SuggestionBox.jsx";
import InsightsDashboard from "./components/InsightsDashboard.jsx";
import { Eye } from "lucide-react";
import "./App.css";
import Guitar from "./assets/Guitar.png";
import { clearAllGraphData } from "./utils/graphData.jsx";

function App() {
  clearAllGraphData();
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

  const [suggestions, setSuggestions] = useState([
    {
      id: 1,
      type: "clarity",
      text: 'Consider rephrasing for clarity: "Our data shows significant growth" instead of "The numbers went up"',
    },
    {
      id: 2,
      type: "tone",
      text: 'Try a more confident tone: "I am confident that" instead of "I think maybe"',
    },
    {
      id: 3,
      type: "structure",
      text: 'Add a transition here to improve flow: "Furthermore," or "Additionally,"',
    },
  ]);

  // insights data
  const [speechLengthData, setSpeechLengthData] = useState([]);
  const [fillerWordsOverTime, setFillerWordsOverTime] = useState([]);
  const [mostRecentTranscript, setMostRecentTranscript] = useState("");
  const [mostRecentLength, setMostRecentLength] = useState(100);
  const [mostRecentTone, setMostRecentTone] = useState("Neutral");
  const [mostRecentWordCount, setMostRecentWordCount] = useState(100);
  const [overallScoreData, setOverallScoreData] = useState([]);
  const [mostRecentScore, setMostRecentScore] = useState(0);

  return (
    <div className="w-screen h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-2 border-b-2 border-gray-700 gap-4">
        <h2 className="text-2xl font-semibold text-white">TalkStar</h2>
        <img src={Guitar} alt="logo" className="h-10 transform rotate-45" />
      </div>
      <div className="h-[95vh] w-screen flex bg-gray-900">
        {/* Left half */}
        <div className="w-1/2 bg-gray-900 p-4">
          <div className="h-full bg-gray-800 rounded-lg shadow-sm p-4">
            <TranscriptChat
              setMostRecentTranscript={setMostRecentTranscript}
              setMostRecentLength={setMostRecentLength}
              setMostRecentWordCount={setMostRecentWordCount}
              setMostRecentTone={setMostRecentTone}
              setMostRecentScore={setMostRecentScore}
              setSuggestions={setSuggestions}
            />
          </div>
        </div>

        {/* Right half */}
        <div ref={containerRef} className="w-1/2 relative bg-gray-900 p-4">
          <div className="w-full h-full bg-gray-900 rounded-lg shadow-sm p-4">
            {/* Top section */}
            <div
              className="absolute top-0 left-0 right-0 bg-gray-800 p-4 overflow-y-auto"
              style={{ height: `${rightSplitPosition}%` }}
            >
              <SuggestionBox
                suggestions={suggestions}
                setSuggestions={setSuggestions}
              />
            </div>

            {/* Draggable divider */}
            <div
              className="absolute left-0 right-0 h-2 bg-gray-700 cursor-ns-resize hover:bg-blue-400 transition-colors"
              style={{ top: `${rightSplitPosition}%`, marginTop: "-4px" }}
              onMouseDown={handleMouseDown}
            />

            {/* Bottom section */}
            <div
              className="absolute bottom-0 left-0 right-0 bg-gray-200 p-4 bg-gray-800 h-full overflow-y-hidden"
              style={{ height: `${100 - rightSplitPosition}%` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Eye className="text-yellow-500" size={20} />
                <h2 className="text-lg font-semibold">Insights</h2>
              </div>
              <div className="h-full overflow-y-auto">
                <InsightsDashboard
                  mostRecentTranscript={mostRecentTranscript}
                  mostRecentLength={mostRecentLength}
                  mostRecentWordCount={mostRecentWordCount}
                  mostRecentTone={mostRecentTone}
                  mostRecentScore={mostRecentScore}
                  speechLengthData={speechLengthData}
                  fillerWordsOverTime={fillerWordsOverTime}
                  overallScoreData={overallScoreData}
                  setFillerWordsOverTime={setFillerWordsOverTime}
                  setSpeechLengthData={setSpeechLengthData}
                  setSuggestions={setSuggestions}
                  setOverallScoreData={setOverallScoreData}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
