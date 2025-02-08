import React, { useState, useRef } from "react";
import AudioUploadChat from "./AudioUploadChat";
import axios from "axios";
import { Audio } from "react-loader-spinner";

const API_KEY = "dfbd6698ce39402fba92db96f2fe6daf"; // Replace with your actual API key
const ASSEMBLYAI_URL = "https://api.assemblyai.com/v2";

const TranscriptChat = ({
  setMostRecentTranscript,
  setMostRecentWordCount,
  setMostRecentLength,
  setMostRecentTone,
}) => {
  const [loading, setLoading] = useState(false);
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

  const uploadFile = async (file) => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await axios.post(`${ASSEMBLYAI_URL}/upload`, formData, {
        headers: {
          Authorization: API_KEY,
          "Content-Type": "application/octet-stream",
        },
      });
      return uploadRes.data.upload_url;
    } catch (error) {
      console.error("Upload Error:", error);
    }
  };

  const transcribeAudio = async (fileUrl) => {
    try {
      const res = await axios.post(
        `${ASSEMBLYAI_URL}/transcript`,
        {
          audio_url: fileUrl,
          sentiment_analysis: true,
          entity_detection: true,
        },
        {
          headers: {
            Authorization: API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
      return res.data.id;
    } catch (error) {
      console.error("Transcription Error:", error);
    }
  };

  const fetchTranscription = async (transcriptId) => {
    let status = "queued";
    let result;
    while (status !== "completed" && status !== "failed") {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const response = await axios.get(
        `${ASSEMBLYAI_URL}/transcript/${transcriptId}`,
        {
          headers: { Authorization: API_KEY },
        }
      );
      result = response.data;
      status = result.status;
    }
    return status === "completed" ? result : null;
  };

  const handleTranscription = async (file) => {
    const fileUrl = await uploadFile(file);
    if (!fileUrl) return;
    const transcriptId = await transcribeAudio(fileUrl);
    if (!transcriptId) return;
    const transcriptData = await fetchTranscription(transcriptId);

    setLoading(false);

    return transcriptData;
  };

  const handleNewFile = async (file) => {
    try {
      setLoading(true);
      const analysisResult = await handleTranscription(file);

      const newChat = {
        id: chatHistory.length + 1,
        fileName: file.name,
        timestamp: new Date().toLocaleTimeString(),
        transcript: analysisResult.text,
      };

      console.log("Analysis Result:", analysisResult);

      setMostRecentTranscript(analysisResult.text);
      setMostRecentWordCount(analysisResult.words.length);
      setMostRecentLength(analysisResult.audio_duration);
      //   setMostRecentTone(analysisResult.sentiment);

      setChatHistory((prev) => [...prev, newChat]);
      scrollToBottom();
    } catch (error) {
      setError("Error analyzing file: " + error.message);
    } finally {
      setLoading(false);
      setAudioFile(null);
    }
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

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute left-0 top-0 w-1/2 h-full flex items-center justify-center bg-gray-900 opacity-75 z-10">
          <Audio
            color="#ffffff"
            height={64}
            width={64}
            className="opacity-100"
          />
        </div>
      )}

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
