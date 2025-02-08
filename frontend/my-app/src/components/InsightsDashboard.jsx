import React from "react";
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
  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-sm">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold text-gray-100">{value}</h2>
    </div>
  </div>
);

const InsightsDashboard = () => {
  // Sample data - replace with your actual data
  // bar chart data
  const fillerWordsData = [
    { phrase: "um", count: 5 },
    { phrase: "like", count: 3 },
    { phrase: "you know", count: 2 },
    { phrase: "so", count: 4 },
    { phrase: "actually", count: 1 },
  ];

  // filler words over past speeches
  const fillerWordsOverTime = [
    { speechId: 1, count: 5 },
    { speechId: 2, count: 3 },
    { speechId: 3, count: 2 },
    { speechId: 4, count: 4 },
    { speechId: 5, count: 1 },
  ];

  // wpm over past speeches
  const speechLengthData = [
    { speechId: 1, avgWords: 100 },
    { speechId: 2, avgWords: 120 },
    { speechId: 3, avgWords: 90 },
    { speechId: 4, avgWords: 110 },
    { speechId: 5, avgWords: 95 },
  ];

  const overallTone = "CONFIDENT";
  const totalFillerWords = fillerWordsData.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const averageWordsPerMinute = Math.round(
    speechLengthData[speechLengthData.length - 1].words / 2.5
  );

  return (
    <div className="p-6 space-y-6">
      {/* Tone Display */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-gray-100 mb-2">OVERALL TONE</p>
            <h1 className="text-6xl font-bold text-blue-600 tracking-wide">
              {overallTone}
            </h1>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
        <CircleStatCard title="Duration" value="2:30" />
        <CircleStatCard title="Words" value="600" />
        <CircleStatCard title="Filler Words" value="15" />
        <CircleStatCard title="WPM" value="240" />
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
                <LineChart data={speechLengthData}>
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
                <LineChart data={fillerWordsOverTime}>
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
