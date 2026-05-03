import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    dateOfBirth: {
      type: Date,
      default: null, // Default to null so it's easy to check if set during onboarding
    },
    bio: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    workAs: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "in-relationship", "engaged", "not-say", ""],
      default: "",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    // Add this inside userSchema
    currentStory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      default: null,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// This ensures that .sort({ createdAt: -1 }) happens at the database level instantly.
userSchema.index({ createdAt: -1 });
userSchema.index({ fullName: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

userSchema.post(["find", "findOne", "findOneAndUpdate"], async function (docs) {
  if (!docs) return;

  const users = Array.isArray(docs) ? docs : [docs];

  for (const user of users) {
    if (user.currentStory) {
      // Check if the story still exists in the database
      const storyExists = await mongoose
        .model("Story")
        .exists({ _id: user.currentStory });

      if (!storyExists) {
        // If the story is gone (deleted by TTL), wipe the ID from the user
        await mongoose.model("User").findByIdAndUpdate(user._id, {
          $set: { currentStory: null },
        });
        // Update the local object so the controller sees the change immediately
        user.currentStory = null;
      }
    }
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  const isPassworCorrect = await bcrypt.compare(enteredPassword, this.password);
  return isPassworCorrect;
};

const User = mongoose.model("User", userSchema);
export default User;
