"use client";

const GOAL_OPTIONS = [
  "Daily revenue summary",
  "Create payment links fast",
  "Budget guardian",
  "Cash forecast",
  "Expense advice",
  "Reminders",
  "Other",
];

export function Step5Goals({
  selectedGoals,
  setSelectedGoals,
  otherGoalText,
  setOtherGoalText,
  additionalDetails,
  setAdditionalDetails,
}: {
  selectedGoals: string[];
  setSelectedGoals: (g: string[]) => void;
  otherGoalText: string;
  setOtherGoalText: (t: string) => void;
  additionalDetails: string;
  setAdditionalDetails: (t: string) => void;
}) {
  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
      if (goal === "Other") {
        setOtherGoalText("");
      }
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const detailsCharCount = (additionalDetails || "").length;
  const isDetailsOverLimit = detailsCharCount > 2000;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-instrument text-3xl text-primary mb-2">
          Quick Goals & Preferences
        </h2>
        <p className="font-intert text-secondary text-sm">
          Tell your AI agent what matters most to you.
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-primary font-intert">
          What do you want the AI to help with?
        </label>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className={`px-4 py-2 rounded-xl text-xs font-medium font-intert transition-all ${
                selectedGoals.includes(goal)
                  ? "btn-brand-solid shadow-xs"
                  : "bg-surface border border-border text-secondary hover:border-brand/40"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>

        {selectedGoals.includes("Other") && (
          <div className="pt-2 animate-in fade-in slide-in-from-top-2">
            <input
              type="text"
              placeholder="Specify what else the AI should help with..."
              value={otherGoalText}
              onChange={(e) => setOtherGoalText(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-primary font-intert text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
            />
          </div>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <label
          htmlFor="additionalDetails"
          className="text-sm font-medium text-primary font-intert"
        >
          Additional Details{" "}
          <span className="text-muted font-normal">
            (optional, max 2000 chars)
          </span>
        </label>
        <textarea
          id="additionalDetails"
          placeholder="Any other rules or details the AI should keep in mind about how you run your store..."
          maxLength={2000}
          rows={5}
          value={additionalDetails}
          onChange={(e) => {
            setAdditionalDetails(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          className={`w-full bg-surface border rounded-xl px-4 py-2.5 text-primary font-intert text-sm placeholder:text-muted focus:outline-none focus:ring-2 transition-all resize-none max-h-[300px] overflow-y-auto ${
            isDetailsOverLimit
              ? "border-danger focus:ring-danger focus:border-danger"
              : "border-border focus:ring-brand focus:border-brand"
          }`}
        />
        <div
          className={`text-right text-xs font-intert ${
            isDetailsOverLimit ? "text-danger" : "text-muted"
          }`}
        >
          {detailsCharCount} / 2000 chars
        </div>
      </div>
    </div>
  );
}
