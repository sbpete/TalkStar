import React, { useState, useRef } from "react";
import AudioUploadChat from "./AudioUploadChat";
import axios from "axios";
import { Audio } from "react-loader-spinner";
import Anthropic from "@anthropic-ai/sdk";
import { uploadAudioToPinata, storeAudioMetadata } from "../utils/pinata";
import AudioDropdown from "./AudioDropdown";
import { CgTranscript } from "react-icons/cg";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true,
});

const API_KEY = process.env.ASSEMBLY_AI_API_KEY;
const ASSEMBLYAI_URL = "https://api.assemblyai.com/v2";

const TranscriptChat = ({
  setMostRecentTranscript,
  setMostRecentWordCount,
  setMostRecentLength,
  setMostRecentTone,
  setSuggestions,
  setMostRecentScore,
}) => {
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
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

    // use openai to get suggestions
    const transcript = result.text;

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content:
            "Provide suggestions for the following speech: " +
            transcript +
            ". Split your suggestions with a period. Include nothing else in the message. Limit to 3 suggestions.",
        },
      ],
    });

    const suggestions = msg.content[0].text.split(".");

    console.log("Suggestions:", suggestions);

    let count = 0;

    const suggestionsObject = suggestions.map((suggestion) => ({
      id: count++,
      text: suggestion,
    }));

    // add all suggestions to the state except the last one
    setSuggestions(suggestionsObject.slice(0, suggestionsObject.length - 1));

    return status === "completed" ? result : null;
  };

  const handleTranscription = async (file) => {
    const fileUrl = await uploadFile(file);
    if (!fileUrl) return;
    const transcriptId = await transcribeAudio(fileUrl);
    if (!transcriptId) return;
    const transcriptData = await fetchTranscription(transcriptId);

    return transcriptData;
  };

  const analyzeTone = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      body: formData,
      mode: "cors", // Ensures CORS requests are handled correctly
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Analysis failed");
    }

    console.log("Tone Analysis:", data);

    // classify the tone based on the following properties: jitter, mean_pitch, and shimmer
    const results = data.results;

    let tone = "Neutral";

    if (results.jitter > 0.5) {
      tone = "Nervous";
    }

    if (results.shimmer > 0.5) {
      tone = "Aggressive";
    }

    if (results.mean_pitch > 200) {
      tone = "Excited";
    }

    if (results.mean_pitch < 100) {
      tone = "Sad";
    }

    if (results.mean_pitch < 50) {
      tone = "Depressed";
    }

    if (results.jitter < 0.1) {
      tone = "Calm";
    }

    return tone;
  };

  const handleNewFile = async (file) => {
    try {
      setLoading(true);
      const analysisResult = await handleTranscription(file);
      const tone = await analyzeTone(file);

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
      setMostRecentTone(tone);

      // get overall score based on all the metrics using claude
      const msg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content:
              "Analyze the following speech and provide an overall score out of 100: " +
              analysisResult.text +
              ". use the following metrics: tone: " +
              tone +
              ", length: " +
              analysisResult.audio_duration +
              ", word count: " +
              analysisResult.words.length +
              ", clarity: " +
              analysisResult.text +
              ". Limit to 1 score. Provide the score only.",
          },
        ],
      });

      console.log("Message:", msg);

      const score = msg.content[0].text;

      setMostRecentScore(score);

      // upload to pinata
      const metadata = {
        name: audioFile.name,
        duration: 120, // in seconds
        speechId: Math.floor(Math.random() * 1000),
      };

      const uploadedFile = await uploadAudioToPinata(audioFile, metadata);
      await storeAudioMetadata(uploadedFile.ipfsHash, uploadedFile.metadata);

      setLoading(false);

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
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <CgTranscript className="w-6 h-6 text-yellow-500" />
          <h2 className="text-lg font-semibold">Transcription Chat</h2>
        </div>
        <AudioDropdown />
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

      <div className="p-2 overflow-y-auto h-full">
        {/* Chat History */}
        <div className="flex-1 p-2">
          {error && (
            <p variant="error" className="mb-4 text-red-500">
              {error}
            </p>
          )}

          {chatHistory.length === 0 && (
            <p className="text-gray-500 text-left pb-2">
              No chat history. Upload an audio file to get started!
            </p>
          )}

          {chatHistory.map((chat) => (
            <div key={chat.id} className="mb-6 rounded-lg text-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">{chat.timestamp}</span>
                <span className="text-sm font-medium">{chat.fileName}</span>
              </div>

              <div className="whitespace-pre-wrap text-left text-gray-400">
                {chat.transcript}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Audio Upload Section */}
        <p className="text-gray-200 text-left pb-2">
          {audioFile
            ? "Selected file:"
            : chatHistory.length === 0
            ? ""
            : "Upload a new file to continue."}
        </p>
        <AudioUploadChat audioFile={audioFile} setAudioFile={setAudioFile} />
      </div>
      {/* Submit Button */}
      <div className="pt-4" />
      <div
        className="w-full bg-blue-500 text-white rounded-md py-2 text-center cursor-pointer hover:bg-blue-600 font-semibold"
        onClick={() => handleNewFile(audioFile, error)}
      >
        Submit
      </div>
    </div>
  );
};

export default TranscriptChat;
