import React from "react";
import { Lightbulb, ChevronRight } from "lucide-react";

const SuggestionBox = ({ suggestions, setSuggestions }) => {
  const getTypeColor = (type) => {
    const colors = {
      clarity: "bg-blue-50 border-blue-200",
      tone: "bg-purple-50 border-purple-200",
      structure: "bg-green-50 border-green-200",
      default: "bg-gray-50 border-gray-200",
    };
    return colors[type] || colors.default;
  };

  const getTypeLabel = (type) => {
    const labels = {
      clarity: "Clarity",
      tone: "Tone",
      structure: "Structure",
      default: "Suggestion",
    };
    return labels[type] || labels.default;
  };

  return (
    <div className="w-full max-w-4xl p-4">
      <div className="flex items-start gap-2 mb-4">
        <Lightbulb className="text-yellow-500" size={20} />
        <h2 className="text-lg font-semibold">AI Suggestions</h2>
      </div>

      <div className="flex flex-col gap-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`p-4 rounded-lg border ${getTypeColor(
              suggestion.type
            )} transition-all hover:shadow-md text-left`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {getTypeLabel(suggestion.type)}
              </span>
            </div>

            <p className="text-gray-700">{suggestion.text}</p>

            <div className="flex gap-2 mt-3">
              <div
                className="text-sm text-gray-600 rounded-md transition-colors cursor-pointer"
                onClick={() =>
                  setSuggestions(
                    suggestions.filter((s) => s.id !== suggestion.id)
                  )
                }
              >
                Dismiss
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionBox;
