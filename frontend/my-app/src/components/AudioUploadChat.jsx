import React, { useState, useRef } from "react";
import { Upload, Play, Pause, Trash2 } from "lucide-react";

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
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-start">
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
            className="flex items-center gap-2 px-4 py-2 text-white rounded-md cursor-pointer border border-gray-700 hover:bg-gray-700"
          >
            <Upload size={16} />
            Upload Audio
          </label>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <p variant="error" className="mb-4 text-red-500">
            {error}
          </p>
        )}

        {audioFile && (
          <div className="bg-gray-700 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium truncate">{audioFile.name}</span>
              <div className="flex items-center space-x-2">
                <div
                  onClick={handleRemoveFile}
                  className="p-2 text-gray-200 hover:text-red-600
                        rounded-full hover:bg-red-100 cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </div>
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
