"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { Step1BusinessProfile } from "./components/Step1BusinessProfile";
import { Step2Razorpay } from "./components/Step2Razorpay";
import { Step3Expenses } from "./components/Step3Expenses";
import { Step4Products } from "./components/Step4Products";
import { Step5Goals } from "./components/Step5Goals";
import {
  BusinessProfile,
  RazorpayKeys,
  ExpenseRow,
  ProductRow,
} from "../types/onboarding";

const TOTAL_STEPS = 5;

const generateId = () => Math.random().toString(36).slice(2, 9);

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const [profile, setProfile] = useState<BusinessProfile>({
    businessName: "",
    businessType: "",
    businessTypeOther: "",
    businessDescription: "",
    city: "",
    language: "English",
    ownerName: "",
  });

  const [razorpayKeys, setRazorpayKeys] = useState<RazorpayKeys>({
    keyId: "",
    keySecret: "",
    connected: false,
  });

  const [expenses, setExpenses] = useState<ExpenseRow[]>([
    {
      id: generateId(),
      category: "Shop Rent",
      amount: "15,000",
      dueDate: "5th of month",
      notes: "",
    },
    {
      id: generateId(),
      category: "Staff Salary",
      amount: "25,000",
      dueDate: "1st",
      notes: "2 staff",
    },
    {
      id: generateId(),
      category: "Electricity + Water",
      amount: "3,500",
      dueDate: "",
      notes: "",
    },
  ]);

  const [products, setProducts] = useState<ProductRow[]>([
    {
      id: generateId(),
      name: "Maggi 12-pack",
      costPrice: "120",
      sellingPrice: "145",
      currentStock: "48",
      lowStockAlert: "10",
    },
    {
      id: generateId(),
      name: "Amul Milk 1L",
      costPrice: "58",
      sellingPrice: "62",
      currentStock: "30",
      lowStockAlert: "15",
    },
  ]);

  const [skipInventory, setSkipInventory] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [otherGoalText, setOtherGoalText] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        if (
          !profile.businessName.trim() ||
          !profile.city.trim() ||
          !profile.language
        )
          return false;
        if (!profile.businessType) return false;
        if (
          profile.businessType === "Other" &&
          !profile.businessTypeOther.trim()
        )
          return false;
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    router.push("/merchant");
  };

  const isLastStep = currentStep === TOTAL_STEPS - 1;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <nav className="w-full flex items-center justify-between px-6 sm:px-8 py-5 border-b border-border">
        <Link
          href="/"
          className="text-primary font-instrument italic text-xl font-normal tracking-tight hover:opacity-85 transition-opacity"
        >
          MerchantAgent
        </Link>
        <span className="text-xs font-mono text-muted">
          Step {currentStep + 1} of {TOTAL_STEPS}
        </span>
      </nav>

      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12 w-full">
        <div className="w-full max-w-4xl">
          <div className="min-h-[420px] max-w-3xl mx-auto w-full">
            {currentStep === 0 && (
              <Step1BusinessProfile profile={profile} setProfile={setProfile} />
            )}
            {currentStep === 1 && (
              <Step2Razorpay keys={razorpayKeys} setKeys={setRazorpayKeys} />
            )}
            {currentStep === 2 && (
              <Step3Expenses expenses={expenses} setExpenses={setExpenses} />
            )}
            {currentStep === 3 && (
              <Step4Products
                products={products}
                setProducts={setProducts}
                skipInventory={skipInventory}
                setSkipInventory={setSkipInventory}
              />
            )}
            {currentStep === 4 && (
              <Step5Goals
                selectedGoals={selectedGoals}
                setSelectedGoals={setSelectedGoals}
                otherGoalText={otherGoalText}
                setOtherGoalText={setOtherGoalText}
                additionalDetails={additionalDetails}
                setAdditionalDetails={setAdditionalDetails}
              />
            )}
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 max-w-2xl mx-auto w-full">
            <div>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium font-intert text-secondary hover:text-primary transition-colors"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {(currentStep === 2 || currentStep === 3) && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-intert text-muted hover:text-primary transition-colors"
                >
                  Skip for now
                </button>
              )}

              {isLastStep ? (
                <button
                  type="button"
                  onClick={handleFinish}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-bg text-sm font-medium font-intert hover:opacity-90 transition-opacity"
                >
                  Your AI Agent is ready <Sparkles size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-bg text-sm font-medium font-intert hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
