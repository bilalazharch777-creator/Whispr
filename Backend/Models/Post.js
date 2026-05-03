import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    media: {
      // Each media object stores a Cloudinary URL for image or video
      type: [
        {
          url: {
            type: String,
            required: true,
            // validate Cloudinary URL pattern
            match: [
              /^https?:\/\/(res\.cloudinary\.com)\//,
              "Must be a Cloudinary URL",
            ],
            // comment: 'Cloudinary URL for image or video'
          },
          type: { type: String, enum: ["image", "video"] },
        },
      ],
      validate: {
        validator: function (arr) {
          if (!arr || arr.length === 0) return true; // no media
          if (arr[0].type === "video") {
            // Only one video allowed
            return arr.length === 1 && arr[0].type === "video";
          }
          // Only images, up to 4
          return arr.every((m) => m.type === "image") && arr.length <= 4;
        },
        message:
          "Media must be either a single video or up to 4 images, or empty.",
      },
      default: undefined,
    },
    background: {
      bgType: {
        type: String,
        enum: ["color", "image"],
        default: "color",
      },
      value: {
        type: String,
        default: "#ffffff", // This can store the hex code OR the local path like "/bg/pattern1.png"
      },
    },
    textStyle: {
      color: {
        type: String,
        enum: ["white", "black"],
        default: "black",
      },
      fontWeight: {
        type: String,
        enum: ["normal", "bold"],
        default: "normal",
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Text index for search functionality
postSchema.index({ text: "text" });
postSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Post", postSchema);
