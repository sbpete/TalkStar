import React, { useState, useRef } from "react";
import AudioUploadChat from "./AudioUploadChat";

const TranscriptChat = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      fileName: "Sample.mp3",
      timestamp: "12:34 PM",
      transcript: "Transcript for Sample.mp3 would appear here.",
    },
    {
      id: 2,
      fileName: "Sample2.mp3",
      timestamp: "12:35 PM",
      transcript: "Transcript for Sample2.mp3 would appear here.",
    },
    {
      id: 3,
      fileName: "Sample3.mp3",
      timestamp: "12:36 PM",
      transcript: "Transcript for Sample3.mp3 would appear here.",
    },
    {
      id: 4,
      fileName: "Sample4.mp3",
      timestamp: "12:37 PM",
      transcript: "Transcript for Sample4.mp3 would appear here.",
    },
    {
      id: 5,
      fileName: "Sample5.mp3",
      timestamp: "12:38 PM",
      transcript: "Transcript for Sample5.mp3 would appear here.",
    },
    {
      id: 6,
      fileName: "Sample6.mp3",
      timestamp: "12:39 PM",
      transcript: "Transcript for Sample6.mp3 would appear here.",
    },
  ]);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);
  const [audioFile, setAudioFile] = useState(null);

  const handleNewFile = (file) => {
    if (!file) {
      setError("Please upload an audio file");
      return;
    }

    if (file) {
      const newChat = {
        id: Date.now(),
        fileName: file.name,
        audioFile: file,
        timestamp: new Date().toLocaleString(),
        // Replace this with your actual transcript processing
        transcript: `Transcript for ${file.name} would appear here.`,
      };

      setChatHistory((prev) => [...prev, newChat]);
      scrollToBottom();
    }

    setAudioFile(null);
    setError("");
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Audio Transcription Chat</h2>
      </div>

      <div className="p-4 overflow-y-auto">
        {/* Chat History */}
        <div className="flex-1 p-4">
          {error && (
            <p variant="error" className="mb-4 text-red-500">
              {error}
            </p>
          )}

          {chatHistory.map((chat) => (
            <div key={chat.id} className="mb-6 rounded-lg text-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">{chat.timestamp}</span>
                <span className="text-sm font-medium">{chat.fileName}</span>
              </div>

              <div className="whitespace-pre-wrap">{chat.transcript}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Audio Upload Section */}
        <AudioUploadChat audioFile={audioFile} setAudioFile={setAudioFile} />
      </div>
      {/* Submit Button */}
      <div
        className="w-full bg-blue-500 text-white rounded-md py-2 text-center cursor-pointer hover:bg-blue-600"
        onClick={() => handleNewFile(audioFile, error)}
      >
        Submit
      </div>
    </div>
  );
};

export default TranscriptChat;
