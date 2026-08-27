import React from "react";

type Strength = 0 | 1 | 2 | 3 | 4;

interface PasswordStrengthBarProps {
  strength: Strength;
}

export function PasswordStrengthBar({ strength }: PasswordStrengthBarProps) {
  const getStrengthColor = (index: number) => {
    if (index >= strength) return "bg-surface-muted";
    if (strength <= 1) return "bg-danger";
    if (strength === 2) return "bg-warning";
    if (strength === 3) return "bg-brand";
    return "bg-success";
  };

  const getStrengthText = () => {
    switch (strength) {
      case 0:
      case 1:
        return "Too weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  if (strength === 0) return null;

  return (
    <div className="w-full flex flex-col gap-2 mt-2">
      <div className="flex gap-1 w-full h-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`flex-1 rounded-full transition-colors duration-300 ${getStrengthColor(
              index,
            )}`}
          />
        ))}
      </div>
      <div className="text-xs text-muted font-intert flex justify-end">
        {getStrengthText()}
      </div>
    </div>
  );
}
