import React, { useState, useEffect, use } from "react";
import {
  LineChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getFillerWordsData,
  getSpeechLengthData,
  getOverallScoreData,
  storeFillerWordsData,
  storeSpeechLengthData,
  storeOverallScoreData,
} from "../utils/graphData";
import Knob from "../assets/Knob.png";

const Card = ({ children, className }) => (
  <div className={`rounded-lg ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => (
  <div className="p-4 border-b">{children}</div>
);

const CardTitle = ({ children, className }) => (
  <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>
);

const CardContent = ({ children }) => <div className="p-4">{children}</div>;

const CircleStatCard = ({ title, value, color }) => (
  <div className="flex-col items-center justify-center p-4 rounded-lg relative gap-12">
    <p className="text-sm text-gray-500">{title}</p>

    <div className="text-center z-10 w-full">
      <img
        src={Knob}
        alt="knob"
        className="max-w-24 opacity-50"
        style={{
          transform: `rotate(${value}deg)`,
          transition: "transform 0.3s ease-in-out",
        }}
      />
      <h2 className="text-3xl font-bold text-gray-100 absolute top-21 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
        {value}
      </h2>
    </div>
  </div>
);

const FILLER_WORDS = new Set([
  "um",
  "uh",
  "like",
  "you know",
  "I mean",
  "so",
  "actually",
  "basically",
  "kind of",
  "sort of",
]);

const fillerWordsOverTimeDummyData = [
  { speechId: "1", count: 5 },
  { speechId: "2", count: 3 },
  { speechId: "3", count: 2 },
  { speechId: "4", count: 4 },
  { speechId: "5", count: 1 },
];

const speechLengthDataDummy = [
  { speechId: "1", avgWords: 100 },
  { speechId: "2", avgWords: 120 },
  { speechId: "3", avgWords: 90 },
  { speechId: "4", avgWords: 110 },
  { speechId: "5", avgWords: 95 },
];

const overallScoreDataDummy = [
  { speechId: "1", score: 80 },
  { speechId: "2", score: 85 },
  { speechId: "3", score: 75 },
  { speechId: "4", score: 90 },
  { speechId: "5", score: 88 },
];

const InsightsDashboard = ({
  mostRecentTranscript,
  mostRecentLength,
  mostRecentWordCount,
  mostRecentTone,
  fillerWordsOverTime,
  speechLengthData,
  setFillerWordsOverTime,
  setSpeechLengthData,
  setSuggestions,
  mostRecentScore,
  overallScoreData,
  setOverallScoreData,
}) => {
  const [fillerWordsData, setFillerWordsData] = useState([
    { phrase: "um", count: 10 },
    { phrase: "uh", count: 5 },
    { phrase: "like", count: 7 },
    { phrase: "kind of", count: 3 },
  ]);
  const [fillerWordsCount, setFillerWordsCount] = useState(0);

  useEffect(() => {
    const fetchFillerWordsData = async () => {
      try {
        const data = await getFillerWordsData();
        setFillerWordsOverTime(data);
      } catch (error) {
        console.error("Error fetching filler words data:", error);
      }
    };

    const fetchSpeechLengthData = async () => {
      try {
        const data = await getSpeechLengthData();
        setSpeechLengthData(data);
      } catch (error) {
        console.error("Error fetching speech length data:", error);
      }
    };

    const fetchOverallScoreData = async () => {
      try {
        const data = await getOverallScoreData();
        setOverallScoreData(data);
      } catch (error) {
        console.error("Error fetching overall score data:", error);
      }
    };

    fetchFillerWordsData();
    fetchSpeechLengthData();
    fetchOverallScoreData();
  }, []);

  useEffect(() => {
    if (!mostRecentTranscript) return;

    let suggestions = [];

    console.log("Most recent transcript:", mostRecentTranscript);

    let words = mostRecentTranscript.split(" ");
    words = words.map((word) =>
      word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    );
    const fillerWords = words.filter((word) =>
      FILLER_WORDS.has(word.toLowerCase())
    );
    setFillerWordsCount(fillerWords.length);

    // update filler words data in format array with { phrase, count }
    const fillerWordsMap = {};

    fillerWords.forEach((word) => {
      const key = word.toLowerCase();
      if (fillerWordsMap[key]) {
        fillerWordsMap[key]++;
      } else {
        fillerWordsMap[key] = 1;
      }
    });

    const fillerWordsData = Object.keys(fillerWordsMap).map((key) => ({
      phrase: key,
      count: fillerWordsMap[key],
    }));

    setFillerWordsData(fillerWordsData);

    // update filler words over time data
    const newFillerWordsOverTime = [
      ...fillerWordsOverTime,
      { speechId: fillerWordsOverTime.length + 1, count: fillerWords.length },
    ];

    setFillerWordsOverTime(newFillerWordsOverTime);
    storeFillerWordsData(newFillerWordsOverTime);

    // add to suggestions if filler words count is high
    if (fillerWords.length > 5) {
      suggestions.push({
        id: suggestions.length + 1,
        text: "Try to reduce filler words for a more confident tone",
      });
    }

    console.log("Most recent word count:", mostRecentWordCount);

    // update speech length data
    const newSpeechLengthData = [
      ...speechLengthData,
      {
        speechId: speechLengthData.length + 1,
        avgWords: mostRecentWordCount / (mostRecentLength / 60),
      },
    ];

    setSpeechLengthData(newSpeechLengthData);
    storeSpeechLengthData(newSpeechLengthData);

    // update overall score data with most recent score
    const newOverallScoreData = [
      ...overallScoreData,
      { speechId: overallScoreData.length + 1, score: mostRecentScore },
    ];

    setOverallScoreData(newOverallScoreData);
    storeOverallScoreData(newOverallScoreData);

    // add to suggestions if avg words per minute is low or high
    if (mostRecentWordCount / (mostRecentLength / 60) < 100) {
      suggestions.push({
        id: suggestions.length + 1,
        text: "Your speech may be too slow. Try to speak at a slightly quicker pace",
      });
    } else if (mostRecentWordCount / (mostRecentLength / 60) > 150) {
      suggestions.push({
        id: suggestions.length + 1,

        text: "Your speech may be too fast. Try to slow down for clarity",
      });
    }

    console.log("Suggestions:", suggestions);
    setSuggestions((prev) => [...prev, ...suggestions]);

    console.log("Most recent length:", mostRecentLength);
  }, [mostRecentTranscript]);

  // get avg words per minute
  const avgWordsPerMinute = Math.round(
    mostRecentWordCount / (mostRecentLength / 60)
  );

  // get duration in minutes and seconds
  const durationMinutes = Math.floor(mostRecentLength / 60);
  const durationSeconds = mostRecentLength % 60;
  const durationString = `${durationMinutes}m ${durationSeconds}s`;

  // most common filler word
  const mostCommonFillerWord = fillerWordsData.sort(
    (a, b) => b.count - a.count
  )[0]?.phrase;

  // percentage change in avg words per minute
  const avgWordsPerMinuteChange =
    Math.round(
      ((avgWordsPerMinute - speechLengthData[0]?.avgWords) /
        speechLengthData[0]?.avgWords) *
        100
    ) || 0;

  // percentage change in overall score
  const overallScoreChange =
    Math.round(((mostRecentScore - 50) / 50) * 100) || 0;

  // percentage change in filler words count
  const fillerWordsChange =
    Math.round(
      ((fillerWordsCount - fillerWordsOverTime[0]?.count) /
        fillerWordsOverTime[0]?.count) *
        100
    ) || 0;

  return (
    <div className="px-4 py-2 space-y-6">
      <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
        {/* Tone Display */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-100 mb-2">OVERALL TONE</p>
              <h1 className="text-6xl font-bold text-blue-600 tracking-wide">
                {mostRecentTone}
              </h1>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-100 mb-2">OVERALL SCORE</p>
              <h1 className="text-6xl font-bold text-blue-600 tracking-wide">
                {mostRecentScore}
              </h1>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
        <CircleStatCard title="Duration" value={durationString} />
        <CircleStatCard title="Words" value={mostRecentWordCount} />
        <CircleStatCard title="Filler Words" value={fillerWordsCount} />
        <CircleStatCard title="WPM" value={avgWordsPerMinute} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Filler Words Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filler Words Used</CardTitle>
            <p className="text-sm text-gray-500">
              Most used: {mostCommonFillerWord}
            </p>
          </CardHeader>
          <CardContent>
            {fillerWordsData.length > 0 && (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fillerWordsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="phrase" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563EB" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {fillerWordsData.length === 0 && (
              <p className="text-gray-500 text-center">No filler words found</p>
            )}
          </CardContent>
        </Card>

        {/* Speech Length Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Words/Min Over Time</CardTitle>
            <p className="text-sm text-gray-500">
              {avgWordsPerMinuteChange}% change
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={
                    speechLengthData.length > 1
                      ? speechLengthData
                      : speechLengthDataDummy
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="speechId" />
                  <YAxis dataKey="avgWords" />
                  <Line
                    type="monotone"
                    dataKey="avgWords"
                    stroke="#fff"
                    strokeWidth={2}
                    dot={{ fill: "#2563EB" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Filler Words Over Time Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filler Words Over Time</CardTitle>
            <p className="text-sm text-gray-500">{fillerWordsChange}% change</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={
                    fillerWordsOverTime.length > 1
                      ? fillerWordsOverTime
                      : fillerWordsOverTimeDummyData
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="speechId" />
                  <YAxis />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#fff"
                    strokeWidth={2}
                    dot={{ fill: "#2563EB" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Overall Score Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overall Score Over Time</CardTitle>
            <p className="text-sm text-gray-500">
              {overallScoreChange}% change
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={
                    overallScoreData.length > 1
                      ? overallScoreData
                      : overallScoreDataDummy
                  }
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="speechId" />
                  <YAxis domain={[0, 100]} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#fff"
                    strokeWidth={2}
                    dot={{ fill: "#2563EB" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="h-16" />
    </div>
  );
};

export default InsightsDashboard;
