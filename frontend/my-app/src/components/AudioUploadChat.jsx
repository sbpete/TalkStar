import React, { useState, useRef } from "react";
import { Upload, Play, Pause, X } from "lucide-react";

const AudioUploadChat = ({ audioFile, setAudioFile }) => {
  const [error, setError] = useState("");
  const audioRef = useRef(null);

  const handleFileChange = (event) => {
    console.log("File change event:", event);
    const file = event.target.files[0];

    if (file) {
      // Check if file is audio
      if (!file.type.startsWith("audio/")) {
        setError("Please upload an audio file");
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setError("");
      setAudioFile(file);
    }
  };

  const handleRemoveFile = () => {
    setAudioFile(null);
    setError("");
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="relative">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
            id="audio-upload"
          />
          <label
            htmlFor="audio-upload"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
          >
            <Upload size={16} />
            Upload Audio
          </label>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {error && (
          <p variant="error" className="mb-4 text-red-500">
            {error}
          </p>
        )}

        {audioFile && (
          <div className="bg-gray-700 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium truncate">{audioFile.name}</span>
              <div
                className="flex items-center gap-4 bg-red-500 text-white p-1 rounded-full cursor-pointer"
                onClick={handleRemoveFile}
              >
                <X size={16} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <audio
                ref={audioRef}
                src={URL.createObjectURL(audioFile)}
                className="w-full"
                controls
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioUploadChat;
