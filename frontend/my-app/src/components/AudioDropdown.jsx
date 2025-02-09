import React, { useState, useEffect } from "react";
import { ChevronDown, Play, Pause, Trash2 } from "lucide-react";
import {
  getOrderedAudioFiles,
  getAudioFileUrl,
  removeAudioFile,
} from "../utils/pinata";
import { FaHistory } from "react-icons/fa";

const AudioDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [audioFiles, setAudioFiles] = useState([]);
  const [playing, setPlaying] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAudioFiles();
  }, []);

  const loadAudioFiles = async () => {
    try {
      setLoading(true);
      const files = await (await getOrderedAudioFiles()).reverse();
      setAudioFiles(files);
    } catch (err) {
      setError("Failed to load audio files");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ipfsHash) => {
    try {
      await removeAudioFile(ipfsHash);
      await loadAudioFiles();
    } catch (err) {
      setError("Failed to delete audio file");
      console.error(err);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-md">
      {/* Dropdown Button */}
      <div onClick={() => setIsOpen(!isOpen)} className="flex items-center">
        <FaHistory
          className={`w-5 h-5 transition-transform ${
            isOpen ? "transform rotate-20" : ""
          }`}
        />
      </div>
      {/* Dropdown Content */}
      {isOpen && (
        <div className="mt-2 bg-gray-100 rounded-xl absolute z-20 w-84 shadow-lg ">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : audioFiles.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No recordings found
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {audioFiles.map((file) => (
                <div key={file.ipfsHash} className="p-6">
                  <div className="flex items-start justify-between text-left gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">
                        {formatDate(file.uploadTimestamp)}
                      </p>
                      <h3 className="font-medium text-gray-900">{file.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        onClick={() => handleDelete(file.ipfsHash)}
                        className="p-2 text-gray-600 hover:text-red-600
                        rounded-full hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <audio
                    className="mt-2 w-full"
                    controls
                    src={getAudioFileUrl(file.ipfsHash)}
                    onEnded={() => setPlaying(null)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioDropdown;
