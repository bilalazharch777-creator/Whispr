// components/OnboardingForm.jsx
import { useNavigate } from "react-router";
import {
  ArrowRight,
  UserCircle,
  MapPin,
  Briefcase,
  Heart,
  Calendar,
  GraduationCap,
  Mail,
} from "lucide-react";

const OnboardingForm = ({
  formState,
  setFormState,
  onSubmit,
  isPending,
  completionPercentage,
}) => {
  const handleChange = (field, value) => {
    setFormState({ ...formState, [field]: value });
  };

  const Navigate = useNavigate();

  const inputFields = [
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      icon: UserCircle,
      placeholder: "Enter your full name",
      required: true,
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      icon: Mail,
      disabled: true,
    },
    {
      name: "city",
      label: "City",
      type: "text",
      icon: MapPin,
      placeholder: "Enter your city",
    },
    {
      name: "country",
      label: "Country",
      type: "text",
      icon: MapPin,
      placeholder: "Enter your country",
    },
    {
      name: "dateOfBirth",
      label: "Date of Birth",
      type: "date",
      icon: Calendar,
    },
    {
      name: "education",
      label: "Education",
      type: "text",
      icon: GraduationCap,
      placeholder: "e.g. Bachelor's in Computer Science",
    },
    {
      name: "workAs",
      label: "Work As",
      type: "text",
      icon: Briefcase,
      placeholder: "e.g. Frontend Developer",
    },
  ];

  const maritalStatusOptions = [
    { value: "single", label: "Single" },
    { value: "in-relationship", label: "In a relationship" },
    { value: "engaged", label: "Engaged" },
    { value: "married", label: "Married" },
    { value: "not-say", label: "Rather Not Say" },
  ];

  const skipHandler = () => {
    console.log("Skip handler Running!");
    Navigate("/");
  };
  return (
    <div className="space-y-6 md:space-y-8 w-full">
      {/* Form Header */}
      <div className="flex items-center justify-between">
        <div className="lg:hidden">
          <h2 className="text-xl md:text-2xl font-bold text-base-content">
            Complete Your Details
          </h2>
          <p className="text-base-content/70 text-xs md:text-sm mt-1">
            Fill in your details to get started
          </p>
        </div>
        <div className="hidden lg:block">
          <h2 className="text-2xl font-bold text-base-content">
            Complete Your Profile
          </h2>
          <p className="text-base-content/70 text-sm mt-1">
            Fill in your details to get started
          </p>
        </div>
        <button
          type="button"
          onClick={skipHandler}
          className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium text-[#0a8dff] hover:text-[#0a8dff]/80 transition-colors group"
        >
          Skip for now
          <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-0.5 md:group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {/* Dynamic Input Fields */}
          {inputFields.map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-base-content">
                <field.icon className="w-3 h-3 md:w-4 md:h-4 text-base-content/60" />
                {field.label}
              </label>
              <div className="relative group">
                <input
                  type={field.type}
                  {...(field.required && { required: true })}
                  value={formState[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  disabled={field.disabled}
                  placeholder={field.placeholder || ""}
                  className={`w-full p-3 md:p-4 pl-10 md:pl-12 rounded-xl bg-base-200 border border-base-300 focus:border-[#0a8dff] focus:ring-1 md:focus:ring-2 focus:ring-[#0a8dff]/20 outline-none transition-all duration-300 text-base-content placeholder:text-base-content/40 hover:border-base-content/30 text-sm ${
                    field.disabled
                      ? "bg-base-200/50 text-base-content/60 cursor-not-allowed"
                      : ""
                  }`}
                />
                <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-[#0a8dff] transition-colors">
                  <field.icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              </div>
            </div>
          ))}

          {/* Marital Status - Special Case */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-base-content">
              <Heart className="w-3 h-3 md:w-4 md:h-4 text-base-content/60" />
              Marital Status
            </label>
            <div className="relative group">
              <select
                value={formState.maritalStatus || ""}
                onChange={(e) => handleChange("maritalStatus", e.target.value)}
                className="w-full p-3 md:p-4 pl-10 md:pl-12 rounded-xl bg-base-200 border border-base-300 focus:border-[#0a8dff] focus:ring-1 md:focus:ring-2 focus:ring-[#0a8dff]/20 outline-none transition-all duration-300 text-base-content hover:border-base-content/30 text-sm appearance-none"
              >
                <option value="">Select your status</option>
                {maritalStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-[#0a8dff] transition-colors">
                <Heart className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-base-content/40 pointer-events-none">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bio - Full Width */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs md:text-sm font-medium text-base-content">
            <svg
              className="w-3 h-3 md:w-4 md:h-4 text-base-content/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            Bio
          </label>
          <textarea
            rows={3}
            value={formState.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Tell us a little about yourself…"
            className="w-full p-3 md:p-4 rounded-xl bg-base-200 border border-base-300 focus:border-[#0a8dff] focus:ring-1 md:focus:ring-2 focus:ring-[#0a8dff]/20 outline-none transition-all duration-300 text-base-content placeholder:text-base-content/40 hover:border-base-content/30 resize-none text-sm"
          />
        </div>

        {/* Progress Bar - Only show on desktop */}
        <div className="hidden lg:block pt-4 border-t border-base-300/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-base-content/60">Profile Completion</span>
            <span className="font-medium text-[#0a8dff]">
              {completionPercentage}%
            </span>
          </div>
          <div className="h-2 bg-base-300 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-[#0a8dff] transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isPending}
            className="relative w-full group"
          >
            <div className="relative overflow-hidden rounded-xl bg-[#0a8dff] hover:bg-[#0a8dff]/90 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-[#0a8dff]/25 hover:shadow-[#0a8dff]/40">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
              <div className="relative z-10 p-3 md:p-4 flex items-center justify-center gap-2 md:gap-3">
                {isPending ? (
                  <>
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-white font-semibold text-sm md:text-base">
                      Saving Profile...
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-white font-semibold text-sm md:text-base">
                      Complete Profile
                    </span>
                  </>
                )}
              </div>
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingForm;
