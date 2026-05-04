import React from "react";
import { useNavigate } from "react-router";
import {
  MapPinned,
  Cake,
  GraduationCap,
  Building2,
  HeartHandshake,
  Palette,
} from "lucide-react";

const BioRow = ({ Icon, children, alignTop = false }) => (
  <div
    className={`flex ${alignTop ? "items-start" : "items-center"} gap-3 py-1 group`}
  >
    <Icon
      size={20}
      className="shrink-0 text-base-content/60 group-hover:text-[#0a8dff] transition-colors duration-300"
    />
    <span className="text-sm md:text-base text-base-content/90 leading-tight">
      {children}
    </span>
  </div>
);

const ProfileBio = ({
  bioData = {
    livesIn: { city: "", country: "" },
    bornOn: "",
    studied: "",
    workAs: "",
    relationshipStatus: "",
    detailedBio: "",
  },
}) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const hasBioInfo = () => {
    return (
      bioData.livesIn?.city ||
      bioData.livesIn?.country ||
      bioData.bornOn ||
      bioData.studied ||
      bioData.workAs ||
      bioData.relationshipStatus ||
      bioData.detailedBio
    );
  };

  if (!hasBioInfo()) {
    return (
      <div className="mt-8 text-center py-8 bg-base-200/30 rounded-xl border border-dashed border-base-content/10">
        <div className="text-base-content/50 italic">
          No bio information added yet
        </div>
        <button
          onClick={() => navigate("/onboarding")}
          className="mt-4 px-6 py-2 rounded-lg bg-[#0a8dff]/10 hover:bg-[#0a8dff]/20 text-[#0a8dff] font-medium transition-all duration-300"
        >
          Add Bio
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 space-y-1">
      {/* Lives In */}
      {(bioData.livesIn?.city || bioData.livesIn?.country) && (
        <BioRow Icon={MapPinned}>
          Lives in{" "}
          <span className="font-medium text-base-content">
            {[bioData.livesIn.city, bioData.livesIn.country]
              .filter(Boolean)
              .join(", ")}
          </span>
        </BioRow>
      )}

      {/* Born On */}
      {bioData.bornOn && (
        <BioRow Icon={Cake}>
          Born on{" "}
          <span className="font-medium text-base-content">
            {formatDate(bioData.bornOn)}
          </span>
        </BioRow>
      )}

      {/* Studied */}
      {bioData.studied && (
        <BioRow Icon={GraduationCap}>
          Studied{" "}
          <span className="font-medium text-base-content">
            {bioData.studied}
          </span>
        </BioRow>
      )}

      {/* Work As */}
      {bioData.workAs && (
        <BioRow Icon={Building2}>
          Works as{" "}
          <span className="font-medium text-base-content">
            {bioData.workAs}
          </span>
        </BioRow>
      )}

      {/* Relationship Status */}
      {bioData.relationshipStatus && (
        <BioRow Icon={HeartHandshake}>
          <span className="font-medium text-base-content capitalize">
            {bioData.relationshipStatus}
          </span>
        </BioRow>
      )}

      {/* Detailed Bio */}
      {bioData.detailedBio && (
        <BioRow Icon={Palette} alignTop={true}>
          <p className="text-base-content/80 italic leading-relaxed">
            {bioData.detailedBio}
          </p>
        </BioRow>
      )}
    </div>
  );
};

export default ProfileBio;
