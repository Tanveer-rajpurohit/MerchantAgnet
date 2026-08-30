"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { Step1BusinessProfile, Step2Razorpay, Step3Expenses, Step4Products, Step5Goals } from "./components";
import { useOnboarding } from "../../hooks/useOnboarding";
import { useProfile } from "../../hooks/useProfile";
import { useAuth } from "../../context/AuthContext";
import type { BusinessProfile, RazorpayKeys, ExpenseRow, ProductRow } from "../types/onboarding";

const TOTAL_STEPS = 5;

const STANDARD_BUSINESS_TYPES = [
  "Kirana / Grocery",
  "D2C / Brand",
  "Service (salon, tuition, repair)",
  "Local E-com",
  "Restaurant / Food",
];

const STANDARD_GOALS = [
  "Daily revenue summary",
  "Create payment links fast",
  "Budget guardian",
  "Cash forecast",
  "Expense advice",
  "Reminders",
];

const generateId = () => Math.random().toString(36).slice(2, 9);

export default function OnboardingPage() {
  const router = useRouter();
  const { refetchUser } = useAuth();
  const { profile: userProfile } = useProfile();
  const {
    savedExpenses,
    savedProducts,
    saveProfile,
    saveExpenses,
    saveProducts,
    completeOnboarding,
    isSavingProfile,
    isSavingExpenses,
    isSavingProducts,
    isCompleting,
  } = useOnboarding();

  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);

  const [profile, setProfile] = useState<BusinessProfile>({
    businessName: "",
    businessType: "Kirana / Grocery",
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
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "Daily revenue summary",
    "Create payment links fast",
  ]);
  const [otherGoalText, setOtherGoalText] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  useEffect(() => {
    if (userProfile) {
      const mp = userProfile.merchant_profile;
      const addr = userProfile.address;

      const savedType = mp?.business_type || "";
      let resolvedType = "Kirana / Grocery";
      let resolvedOther = "";

      if (savedType) {
        if (STANDARD_BUSINESS_TYPES.includes(savedType)) {
          resolvedType = savedType;
          resolvedOther = "";
        } else {
          resolvedType = "Other";
          resolvedOther = savedType;
        }
      }

      setProfile((prev) => ({
        ...prev,
        businessName: mp?.business_name || prev.businessName,
        businessType: resolvedType,
        businessTypeOther: resolvedOther || prev.businessTypeOther,
        businessDescription: mp?.business_description || prev.businessDescription,
        city: addr?.city || prev.city,
        language: mp?.preferred_language || prev.language,
        ownerName: userProfile.full_name || prev.ownerName,
      }));

      const savedHelpWith = userProfile.settings?.ai_info?.help_with || "";
      if (savedHelpWith) {
        const parsed = savedHelpWith.split(", ").filter(Boolean);
        const resolvedGoals: string[] = [];
        let resolvedOtherGoal = "";

        parsed.forEach((goal) => {
          if (STANDARD_GOALS.includes(goal)) {
            resolvedGoals.push(goal);
          } else {
            if (!resolvedGoals.includes("Other")) {
              resolvedGoals.push("Other");
            }
            resolvedOtherGoal = goal;
          }
        });

        setSelectedGoals(resolvedGoals);
        setOtherGoalText(resolvedOtherGoal);
        setAdditionalDetails(userProfile.settings?.ai_info?.rule || "");
      }
    }
  }, [userProfile]);

  useEffect(() => {
    if (savedExpenses && savedExpenses.length > 0) {
      setExpenses(
        savedExpenses.map((e) => ({
          id: e.id,
          category: e.category,
          amount: Number(e.amount).toLocaleString("en-IN"),
          dueDate: e.due_on || "",
          notes: e.notes || "",
        }))
      );
    }
  }, [savedExpenses]);

  useEffect(() => {
    if (savedProducts && savedProducts.length > 0) {
      setProducts(
        savedProducts.map((p) => ({
          id: p.id,
          name: p.product_name,
          costPrice: String(p.cost_price),
          sellingPrice: String(p.selling_price),
          currentStock: String(p.current_stock),
          lowStockAlert: String(p.low_stock_alert),
        }))
      );
    }
  }, [savedProducts]);

  const isSaving = isSavingProfile || isSavingExpenses || isSavingProducts || isCompleting;

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        if (!profile.businessName.trim() || !profile.city.trim() || !profile.language) {
          return false;
        }
        if (!profile.businessType) return false;
        if (profile.businessType === "Other" && !profile.businessTypeOther.trim()) {
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    setStepError(null);

    if (currentStep === 0) {
      const type = profile.businessType === "Other" ? profile.businessTypeOther : profile.businessType;
      try {
        await saveProfile({
          business_name: profile.businessName.trim(),
          business_type: type.trim(),
          business_description: profile.businessDescription.trim() || null,
          city: profile.city.trim(),
          preferred_language: profile.language,
          owner_name: profile.ownerName.trim() || null,
        });
      } catch {
        setStepError("Failed to save business profile. Please try again.");
        return;
      }
    } else if (currentStep === 2) {
      const validExpenses = expenses
        .filter((e) => e.category.trim() && e.amount.trim())
        .map((e) => ({
          category: e.category.trim(),
          amount: parseFloat(e.amount.replace(/,/g, "")) || 0,
          due_on: e.dueDate.trim() || "1st of month",
          notes: e.notes.trim() || null,
        }));

      try {
        await saveExpenses({ expenses: validExpenses });
      } catch {
        setStepError("Failed to save expenses. Please try again.");
        return;
      }
    } else if (currentStep === 3) {
      const validProducts = products
        .filter((p) => p.name.trim())
        .map((p) => ({
          product_name: p.name.trim(),
          cost_price: parseFloat(p.costPrice.replace(/,/g, "")) || 0,
          selling_price: parseFloat(p.sellingPrice.replace(/,/g, "")) || 0,
          current_stock: parseInt(p.currentStock) || 0,
          low_stock_alert: parseInt(p.lowStockAlert) || 5,
        }));

      try {
        await saveProducts({
          products: validProducts,
          skip_inventory: skipInventory,
        });
      } catch {
        setStepError("Failed to save product inventory. Please try again.");
        return;
      }
    }

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    setStepError(null);
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setStepError(null);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setStepError(null);

    const goals = selectedGoals
      .map((g) => (g === "Other" && otherGoalText ? otherGoalText : g))
      .filter(Boolean);

    try {
      await completeOnboarding({
        selected_goals: goals.length > 0 ? goals : ["Daily revenue summary"],
        other_goal_text: otherGoalText.trim() || null,
        additional_details: additionalDetails.trim() || null,
      });

      refetchUser();
      router.push("/dashboard");
    } catch {
      setStepError("Failed to complete onboarding. Please try again.");
    }
  };

  const isLastStep = currentStep === TOTAL_STEPS - 1;

  return (
    <div className="min-h-screen bg-bg flex flex-col font-intert">
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
          {stepError && (
            <div className="max-w-3xl mx-auto mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{stepError}</span>
            </div>
          )}

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
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-secondary hover:text-primary transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {(currentStep === 2 || currentStep === 3) && (
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm text-muted hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                >
                  Skip for now
                </button>
              )}

              {isLastStep ? (
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl btn-brand-solid text-sm font-medium shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isCompleting ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <span>Your AI Agent is ready</span>
                      <Bot size={15} />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed() || isSaving}
                  className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    canProceed() && !isSaving
                      ? "btn-brand-solid shadow-xs cursor-pointer"
                      : "bg-surface-muted text-muted border border-border cursor-not-allowed opacity-90"
                  }`}
                >
                  {isSaving ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
