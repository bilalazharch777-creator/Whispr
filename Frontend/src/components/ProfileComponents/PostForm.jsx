// PostForm.jsx
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  ImageIcon,
  VideoIcon,
  PaletteIcon,
  SendIcon,
  XIcon,
  LayoutIcon,
  BoldIcon,
  TypeIcon,
  PlusIcon,
} from "lucide-react";

const COLOR_PALETTES = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8B195",
  "#C06C84",
];

const BG_IMAGES = [
  "/bg1.jpg",
  "/bg2.jpg",
  "/bg3.jpg",
  "/bg4.jpg",
  "/bg5.jpg",
  "/bg6.jpg",
  "/bg7.jpg",
];

const ToggleGroup = ({ label, options, value, onChange }) => (
  <div className="flex items-center gap-1 bg-base-100 rounded-lg border border-base-300 p-1 shadow-sm">
    <span className="text-xs text-base-content/40 px-1 font-medium">
      {label}
    </span>
    {options.map(({ key, icon: Icon, text, bold }) => (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key)}
        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-all ${
          bold ? "font-bold" : "font-medium"
        }`}
        style={{
          backgroundColor:
            value === key
              ? key === "white"
                ? "#374151"
                : "#0a8dff"
              : "transparent",
          color: value === key ? "#fff" : "#374151",
          border:
            key === "white"
              ? `1px solid ${value === key ? "#374151" : "#e5e7eb"}`
              : undefined,
        }}
      >
        {Icon && <Icon size={13} />}
        <span>{text}</span>
      </button>
    ))}
  </div>
);

const PostForm = ({ postData, setPostData, onSubmit, isUploading }) => {
  const [showPalette, setShowPalette] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);

  const imageRef = useRef(null);
  const videoRef = useRef(null);

  const MAX_MEDIA = 3;

  const updateNested = (category, field, value) => {
    setPostData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  };

  const handleMediaChange = (file, type) => {
    if (postData.mediaFiles.length >= MAX_MEDIA) {
      toast.error(`Maximum ${MAX_MEDIA} media files allowed`);
      return;
    }

    const newMedia = {
      file,
      type,
      previewUrl: URL.createObjectURL(file),
      id: Date.now() + Math.random(), // unique identifier
    };

    setPostData((prev) => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, newMedia],
    }));
  };

  const removeMedia = (id) => {
    setPostData((prev) => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((media) => media.id !== id),
    }));
  };

  const hasCustomBg =
    postData.background.bgType === "image" ||
    postData.background.value !== "#ffffff";

  const textareaStyle = {
    color: postData.textStyle.color === "white" ? "#fff" : "#374151",
    fontWeight: postData.textStyle.fontWeight === "bold" ? "700" : "400",
    textShadow:
      postData.textStyle.color === "white" && hasCustomBg
        ? "0 1px 3px rgba(0,0,0,0.5)"
        : "none",
    transition: "all 0.25s ease",
    ...(postData.background.bgType === "image"
      ? {
          backgroundImage: `url(${postData.background.value})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : hasCustomBg
        ? { backgroundColor: postData.background.value }
        : {}),
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {/* 1. Header Toolbar - unchanged */}
      <div className="flex items-center gap-3 px-1 flex-wrap">
        <ToggleGroup
          value={postData.textStyle.color === "black" ? "dark" : "white"}
          onChange={(val) =>
            updateNested(
              "textStyle",
              "color",
              val === "dark" ? "black" : "white",
            )
          }
          options={[
            { key: "dark", icon: TypeIcon, text: "Dark" },
            { key: "white", icon: TypeIcon, text: "White" },
          ]}
        />
        <ToggleGroup
          value={postData.textStyle.fontWeight}
          onChange={(val) => updateNested("textStyle", "fontWeight", val)}
          options={[
            { key: "normal", text: "Normal" },
            { key: "bold", icon: BoldIcon, text: "Bold", bold: true },
          ]}
        />

        {postData.background.value !== "#ffffff" && (
          <div className="flex items-center gap-1 ml-auto bg-base-100 rounded-lg border border-blue-200 px-2 py-1 shadow-sm">
            <span className="text-xs text-blue-500 font-medium">Custom BG</span>
            <button
              type="button"
              onClick={() =>
                setPostData((prev) => ({
                  ...prev,
                  background: { bgType: "color", value: "#ffffff" },
                }))
              }
              className="text-red-400 hover:text-red-600 ml-1"
            >
              <XIcon size={12} />
            </button>
          </div>
        )}
      </div>

      {/* 2. Textarea and Media Previews */}
      <div className="bg-base-100 rounded-lg shadow-md p-4">
        <textarea
          value={postData.text}
          onChange={(e) =>
            setPostData((prev) => ({ ...prev, text: e.target.value }))
          }
          placeholder="What's on your mind?"
          className="w-full min-h-[140px] p-4 border border-base-300 rounded-lg focus:outline-none resize-none bg-base-200"
          style={textareaStyle}
        />

        {/* Media Gallery - Multiple files */}
        {postData.mediaFiles.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {postData.mediaFiles.map((media) => (
                <div key={media.id} className="relative">
                  {media.type === "image" ? (
                    <img
                      src={media.previewUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={media.previewUrl}
                      controls
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(media.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <XIcon size={14} />
                  </button>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black bg-opacity-50 text-white text-xs rounded">
                    {media.type === "image" ? "📷 Image" : "🎥 Video"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Dropdown Pickers - unchanged */}
      {showBgPicker && (
        <div className="bg-base-100 rounded-lg shadow-md p-3 border border-base-300">
          <div className="flex gap-2 overflow-x-auto">
            {BG_IMAGES.map((bg) => (
              <button
                key={bg}
                type="button"
                onClick={() => {
                  setPostData((prev) => ({
                    ...prev,
                    background: { bgType: "image", value: bg },
                  }));
                  setShowBgPicker(false);
                }}
                className="flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border-2"
                style={{
                  borderColor:
                    postData.background.value === bg
                      ? "#0a8dff"
                      : "transparent",
                }}
              >
                <img src={bg} alt="bg" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {showPalette && (
        <div className="p-3 bg-base-100 rounded-lg shadow-lg border border-base-300">
          <div className="grid grid-cols-6 gap-2">
            {COLOR_PALETTES.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setPostData((prev) => ({
                    ...prev,
                    background: { bgType: "color", value: color },
                  }));
                  setShowPalette(false);
                }}
                className="w-8 h-8 rounded-full border-2"
                style={{
                  backgroundColor: color,
                  borderColor:
                    postData.background.value === color ? "#0a8dff" : "#eee",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. Bottom Controls */}
      <div className="flex items-center justify-between bg-base-100 p-2 rounded-lg border border-base-300 shadow-sm">
        <div className="flex gap-2">
          {/* Add Image Button */}
          <button
            type="button"
            onClick={() => imageRef.current?.click()}
            disabled={postData.mediaFiles.length >= MAX_MEDIA}
            className={`p-2 rounded-lg transition-colors ${
              postData.mediaFiles.length >= MAX_MEDIA
                ? "opacity-50 cursor-not-allowed bg-gray-100"
                : "hover:bg-gray-100"
            }`}
            title={
              postData.mediaFiles.length >= MAX_MEDIA
                ? `Maximum ${MAX_MEDIA} files reached`
                : "Add image"
            }
          >
            <ImageIcon size={20} className="text-blue-500" />
          </button>

          {/* Add Video Button */}
          <button
            type="button"
            onClick={() => videoRef.current?.click()}
            disabled={postData.mediaFiles.length >= MAX_MEDIA}
            className={`p-2 rounded-lg transition-colors ${
              postData.mediaFiles.length >= MAX_MEDIA
                ? "opacity-50 cursor-not-allowed bg-gray-100"
                : "hover:bg-gray-100"
            }`}
            title={
              postData.mediaFiles.length >= MAX_MEDIA
                ? `Maximum ${MAX_MEDIA} files reached`
                : "Add video"
            }
          >
            <VideoIcon size={20} className="text-blue-500" />
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPalette(!showPalette);
              setShowBgPicker(false);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <PaletteIcon size={20} className="text-blue-500" />
          </button>

          <button
            type="button"
            onClick={() => {
              setShowBgPicker(!showBgPicker);
              setShowPalette(false);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <LayoutIcon size={20} className="text-blue-500" />
          </button>

          {/* Media count indicator */}
          {postData.mediaFiles.length > 0 && (
            <span className="flex items-center text-xs text-gray-500 ml-2">
              {postData.mediaFiles.length}/{MAX_MEDIA} media
            </span>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleMediaChange(e.target.files[0], "image");
              e.target.value = ""; // Reset input so same file can be selected again
            }
          }}
        />
        <input
          ref={videoRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleMediaChange(e.target.files[0], "video");
              e.target.value = ""; // Reset input
            }
          }}
        />

        <button
          type="submit"
          disabled={
            isUploading ||
            (!postData.text.trim() && postData.mediaFiles.length === 0)
          }
          className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <SendIcon size={18} />
          )}
          <span>{isUploading ? "Posting..." : "Post"}</span>
        </button>
      </div>
    </form>
  );
};

export default PostForm;
