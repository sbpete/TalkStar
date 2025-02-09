import axios from "axios";
import FormData from "form-data";

// Configuration object for Pinata
const PINATA_CONFIG = {
  apiKey: "a1e437aba36ddb77701d",
  apiSecret: "ce09275a893e06ac82613d04bc7c046a93c4da2db8ff68981ddb8a1b05d073bc",
  gateway: "https://gateway.pinata.cloud/ipfs/",
};

/**
 * Metadata structure for audio files
 * @typedef {Object} AudioMetadata
 * @property {string} name - Original file name
 * @property {string} timestamp - Upload timestamp
 * @property {number} duration - Audio duration in seconds
 * @property {string} speechId - Associated speech ID
 */

/**
 * Uploads an audio file to Pinata
 * @param {File} audioFile - The audio file to upload
 * @param {AudioMetadata} metadata - Metadata for the audio file
 * @returns {Promise<{ipfsHash: string, metadata: AudioMetadata}>}
 */
export const uploadAudioToPinata = async (audioFile, metadata) => {
  try {
    const formData = new FormData();
    formData.append("file", audioFile);

    // Add metadata
    const metadataObject = {
      name: `speech_${metadata.speechId}_${Date.now()}`,
      keyvalues: {
        ...metadata,
        uploadTimestamp: new Date().toISOString(),
      },
    };
    formData.append("pinataMetadata", JSON.stringify(metadataObject));

    // Options for pinning
    const pinataOptions = {
      cidVersion: 1,
      wrapWithDirectory: false,
    };
    formData.append("pinataOptions", JSON.stringify(pinataOptions));

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: PINATA_CONFIG.apiKey,
          pinata_secret_api_key: PINATA_CONFIG.apiSecret,
        },
      }
    );

    return {
      ipfsHash: response.data.IpfsHash,
      metadata: metadataObject.keyvalues,
    };
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
};

/**
 * Retrieves all audio files metadata from Pinata
 * @returns {Promise<Array>} Array of audio file metadata objects
 */
export const getAllAudioFiles = async () => {
  try {
    const response = await axios.get("https://api.pinata.cloud/data/pinList", {
      headers: {
        pinata_api_key: PINATA_CONFIG.apiKey,
        pinata_secret_api_key: PINATA_CONFIG.apiSecret,
      },
      params: {
        status: "pinned",
        metadata: { keyvalues: { type: { value: "audio", op: "eq" } } },
      },
    });

    return response.data.rows.map((item) => ({
      ipfsHash: item.ipfs_pin_hash,
      metadata: item.metadata.keyvalues,
      timestamp: item.date_pinned,
    }));
  } catch (error) {
    console.error("Error retrieving audio files:", error);
    throw error;
  }
};

/**
 * Gets the audio file URL from IPFS hash
 * @param {string} ipfsHash - The IPFS hash of the audio file
 * @returns {string} The gateway URL for the audio file
 */
export const getAudioFileUrl = (ipfsHash) => {
  return `${PINATA_CONFIG.gateway}${ipfsHash}`;
};

/**
 * Stores audio file metadata in local storage for ordering
 * @param {string} ipfsHash - The IPFS hash of the audio file
 * @param {AudioMetadata} metadata - The audio file metadata
 */
export const storeAudioMetadata = async (ipfsHash, metadata) => {
  try {
    const existingMetadata = await getStoredAudioMetadata();
    const updatedMetadata = [...existingMetadata, { ipfsHash, ...metadata }];
    localStorage.setItem("audio_metadata", JSON.stringify(updatedMetadata));
  } catch (error) {
    console.error("Error storing audio metadata:", error);
    throw error;
  }
};

/**
 * Retrieves stored audio metadata from local storage
 * @returns {Promise<Array>} Array of stored audio metadata
 */
export const getStoredAudioMetadata = async () => {
  try {
    const metadata = localStorage.getItem("audio_metadata");
    return metadata ? JSON.parse(metadata) : [];
  } catch (error) {
    console.error("Error retrieving audio metadata:", error);
    throw error;
  }
};

/**
 * Retrieves audio files in chronological order
 * @returns {Promise<Array>} Array of audio files with metadata
 */
export const getOrderedAudioFiles = async () => {
  try {
    const storedMetadata = await getStoredAudioMetadata();
    return storedMetadata.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
  } catch (error) {
    console.error("Error retrieving ordered audio files:", error);
    throw error;
  }
};

/**
 * Removes an audio file from Pinata
 * @param {string} ipfsHash - The IPFS hash of the audio file to remove
 * @returns {Promise<void>}
 */
export const removeAudioFile = async (ipfsHash) => {
  try {
    await axios.delete(`https://api.pinata.cloud/pinning/unpin/${ipfsHash}`, {
      headers: {
        pinata_api_key: PINATA_CONFIG.apiKey,
        pinata_secret_api_key: PINATA_CONFIG.apiSecret,
      },
    });

    // Remove from local storage
    const storedMetadata = await getStoredAudioMetadata();
    const updatedMetadata = storedMetadata.filter(
      (item) => item.ipfsHash !== ipfsHash
    );
    localStorage.setItem("audio_metadata", JSON.stringify(updatedMetadata));
  } catch (error) {
    console.error("Error removing audio file:", error);
    throw error;
  }
};
