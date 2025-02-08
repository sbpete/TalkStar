import React, { useState, useEffect } from "react";
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
  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold text-gray-100">{value}</h2>
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

const InsightsDashboard = ({
  mostRecentTranscript,
  mostRecentLength,
  mostRecentWordCount,
  mostRecentTone,
  fillerWordsOverTime,
  speechLengthData,
  setFillerWordsOverTime,
  setSpeechLengthData,
}) => {
  const [fillerWordsData, setFillerWordsData] = useState([
    { phrase: "um", count: 10 },
    { phrase: "uh", count: 5 },
    { phrase: "like", count: 7 },
    { phrase: "kind of", count: 3 },
  ]);
  const [fillerWordsCount, setFillerWordsCount] = useState(0);

  useEffect(() => {
    if (!mostRecentTranscript) return;

    const words = mostRecentTranscript.split(" ");
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

  return (
    <div className="p-6 space-y-6">
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
              Extra info here, like most used filler words
            </p>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Speech Length Graph */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Words Over Time</CardTitle>
            <p className="text-sm text-gray-500">Extra info here</p>
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
            <p className="text-sm text-gray-500">Extra info here</p>
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
      </div>
    </div>
  );
};

export default InsightsDashboard;
