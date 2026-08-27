import React from "react";

export function AuthFormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[420px] mx-auto flex flex-col justify-center">
      {children}
    </div>
  );
}
