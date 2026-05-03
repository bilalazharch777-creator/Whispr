import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cloudinaryLink: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    // Updated: Store IDs to prevent duplicates
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Views store the static snapshot of the user at the time of viewing
    views: [
      {
        fullName: String,
        profilePic: String,
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 minute TTL
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual field to get the count of likes without sending the whole ID array to the client
storySchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

const Story = mongoose.model("Story", storySchema);
export default Story;
