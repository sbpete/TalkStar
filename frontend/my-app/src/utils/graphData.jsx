import AsyncStorage from "@react-native-async-storage/async-storage";

// Storage keys
const STORAGE_KEYS = {
  FILLER_WORDS: "graph_filler_words_data",
  SPEECH_LENGTH: "graph_speech_length_data",
  OVERALL_SCORE: "graph_overall_score_data",
};

/**
 * Stores filler words data to AsyncStorage
 * @param {Array} data - Array of filler words data objects
 * @returns {Promise<void>}
 */
export const storeFillerWordsData = async (data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEYS.FILLER_WORDS, jsonValue);
  } catch (error) {
    console.error("Error storing filler words data:", error);
    throw error;
  }
};

/**
 * Retrieves filler words data from AsyncStorage
 * @returns {Promise<Array>} Array of filler words data objects
 */
export const getFillerWordsData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.FILLER_WORDS);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error("Error retrieving filler words data:", error);
    throw error;
  }
};

/**
 * Stores speech length data to AsyncStorage
 * @param {Array} data - Array of speech length data objects
 * @returns {Promise<void>}
 */
export const storeSpeechLengthData = async (data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEYS.SPEECH_LENGTH, jsonValue);
  } catch (error) {
    console.error("Error storing speech length data:", error);
    throw error;
  }
};

/**
 * Retrieves speech length data from AsyncStorage
 * @returns {Promise<Array>} Array of speech length data objects
 */
export const getSpeechLengthData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SPEECH_LENGTH);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error("Error retrieving speech length data:", error);
    throw error;
  }
};

/**
 * Updates filler words data by adding new entries
 * @param {Array} newData - Array of new filler words data objects to add
 * @returns {Promise<Array>} Updated array of filler words data
 */
export const updateFillerWordsData = async (newData) => {
  try {
    const existingData = await getFillerWordsData();
    const updatedData = [...existingData, ...newData];
    await storeFillerWordsData(updatedData);
    return updatedData;
  } catch (error) {
    console.error("Error updating filler words data:", error);
    throw error;
  }
};

/**
 * Updates speech length data by adding new entries
 * @param {Array} newData - Array of new speech length data objects to add
 * @returns {Promise<Array>} Updated array of speech length data
 */
export const updateSpeechLengthData = async (newData) => {
  try {
    const existingData = await getSpeechLengthData();
    const updatedData = [...existingData, ...newData];
    await storeSpeechLengthData(updatedData);
    return updatedData;
  } catch (error) {
    console.error("Error updating speech length data:", error);
    throw error;
  }
};

// do same for overall score
export const storeOverallScoreData = async (data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(STORAGE_KEYS.OVERALL_SCORE, jsonValue);
  } catch (error) {
    console.error("Error storing overall score data:", error);
    throw error;
  }
};

export const getOverallScoreData = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.OVERALL_SCORE);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error("Error retrieving overall score data:", error);
    throw error;
  }
};

/**
 * Clears all graph data from AsyncStorage
 * @returns {Promise<void>}
 */
export const clearAllGraphData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.FILLER_WORDS,
      STORAGE_KEYS.SPEECH_LENGTH,
      STORAGE_KEYS.OVERALL_SCORE,
    ]);
  } catch (error) {
    console.error("Error clearing graph data:", error);
    throw error;
  }
};
