import { getProfileImageSrc } from "../../lib/imageHelper";

const ProfileHeader = ({
  profilePic,
  stats = { friends: 0, posts: 0, likes: 0 },
  username = "User",
}) => {
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
  };

  const imageSrc = getProfileImageSrc(profilePic);

  return (
    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
      {/* Profile Picture */}
      <div className="relative">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#0a8dff] via-[#0a8dff]/60 to-[#0a8dff]/30 p-[3px] shadow-lg shadow-[#0a8dff]/20 transition-all duration-300">
          <div className="w-full h-full rounded-full bg-base-200 overflow-hidden flex items-center justify-center border-4 border-base-100">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-20 h-20 md:w-24 md:h-24 text-base-content/40"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Username and Stats */}
      <div className="flex flex-col items-center md:items-start gap-3">
        <div className="text-3xl md:text-4xl font-bold text-base-content">
          {username}
        </div>

        <div className="flex gap-12">
          {/* Friends */}
          <div className="text-center md:text-left">
            <div className="text-3xl md:text-4xl font-light text-base-content/70">
              {formatNumber(stats.friends)}
            </div>
            <div className="text-xs md:text-sm text-base-content/40 tracking-wide mt-1">
              FRIENDS
            </div>
          </div>

          <div className="w-px h-10 bg-base-300/50 self-center"></div>

          {/* Posts */}
          <div className="text-center md:text-left">
            <div className="text-3xl md:text-4xl font-light text-base-content/70">
              {formatNumber(stats.posts)}
            </div>
            <div className="text-xs md:text-sm text-base-content/40 tracking-wide mt-1">
              POSTS
            </div>
          </div>

          <div className="w-px h-10 bg-base-300/50 self-center"></div>

          {/* Likes */}
          <div className="text-center md:text-left">
            <div className="text-3xl md:text-4xl font-light text-base-content/70">
              {formatNumber(stats.likes)}
            </div>
            <div className="text-xs md:text-sm text-base-content/40 tracking-wide mt-1">
              LIKES
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
