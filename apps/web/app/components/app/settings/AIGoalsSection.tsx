"use client";

import { useState } from "react";
import { Bot, Check } from "lucide-react";
import { useProfile } from "../../../../hooks";

const GOAL_OPTIONS = [
  "Daily revenue summary",
  "Create payment links fast",
  "Budget guardian",
  "Cash forecast",
  "Expense advice",
  "Reminders",
  "Other",
];

export function AIGoalsSection() {
  const { profile, updateSettings, isUpdatingSettings } = useProfile();
  const [selectedGoals, setSelectedGoals] = useState<string[] | null>(null);
  const [otherGoalText, setOtherGoalText] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentGoals = selectedGoals ?? (
    profile?.settings?.ai_info?.help_with
      ? profile.settings.ai_info.help_with.split(", ").filter(Boolean)
      : ["Daily revenue summary", "Create payment links fast"]
  );

  const toggleGoal = (goal: string) => {
    if (currentGoals.includes(goal)) {
      const next = currentGoals.filter((g) => g !== goal);
      setSelectedGoals(next);
      if (goal === "Other") {
        setOtherGoalText("");
      }
    } else {
      setSelectedGoals([...currentGoals, goal]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rules = (formData.get("rules") as string) || "";

    const goalsToSave = currentGoals
      .map((g) => (g === "Other" && otherGoalText ? otherGoalText : g))
      .filter(Boolean)
      .join(", ");

    const currentHelpWith = profile?.settings?.ai_info?.help_with || "Daily revenue summary";
    const currentRules = profile?.settings?.ai_info?.rule || "";

    const isChanged =
      goalsToSave !== currentHelpWith ||
      rules.trim() !== currentRules.trim();

    if (!isChanged) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
      return;
    }

    await updateSettings({
      ai_info: {
        help_with: goalsToSave || "Daily revenue summary",
        rule: rules.trim() || null,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 font-intert">
      <form onSubmit={handleFormSubmit}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-brand" />
              <h2 className="text-base font-medium text-primary">
                AI Copilot & Growth Goals
              </h2>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Configure how your AI assistant prioritizes and executes store tasks.
            </p>
          </div>

          {savedSuccess && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in duration-200">
              <Check size={14} />
              <span>Saved</span>
            </span>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-primary block mb-2">
              What should the AI assistant help with?
            </label>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    currentGoals.includes(goal)
                      ? "btn-brand-solid shadow-xs"
                      : "bg-bg border border-border text-secondary hover:border-brand/40"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>

            {currentGoals.includes("Other") && (
              <div className="mt-2.5">
                <input
                  type="text"
                  placeholder="Specify custom AI task..."
                  value={otherGoalText}
                  onChange={(e) => setOtherGoalText(e.target.value)}
                  className="w-full bg-bg border border-border rounded-xl px-3.5 py-2 text-primary text-xs placeholder:text-muted focus:outline-none focus:border-brand/50 transition-all"
                />
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="agentRules"
              className="text-xs font-medium text-primary block mb-1.5"
            >
              Custom Store Instructions & Rules{" "}
              <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="agentRules"
              name="rules"
              rows={4}
              maxLength={2000}
              defaultValue={profile?.settings?.ai_info?.rule || ""}
              key={profile?.settings?.ai_info?.rule || ""}
              placeholder="e.g. Always offer 5% discount on orders above ₹2000, send WhatsApp reminders at 10 AM, use friendly tone..."
              className="w-full bg-bg border border-border rounded-xl p-3 text-primary text-xs placeholder:text-muted focus:outline-none focus:border-brand/50 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdatingSettings}
              className="px-4 py-2 rounded-xl btn-brand-solid text-xs font-medium cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {isUpdatingSettings ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <span>Save AI Preferences</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
