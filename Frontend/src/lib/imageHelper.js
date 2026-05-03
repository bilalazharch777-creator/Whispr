export const getProfileImageSrc = (profilePic) => {
  if (!profilePic) return undefined;

  // Check for Base64, Cloudinary/External URLs, OR local avatar paths
  if (
    profilePic.startsWith("data:") ||
    profilePic.startsWith("http") ||
    profilePic.startsWith("/image")
  ) {
    return profilePic;
  }
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
  return `${baseUrl}${profilePic}`;
};
