import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    // Optional because OAuth users don't have a local password
    password: {
      type: String,
      select: false, // never return by default
    },
    name: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Tracks linked OAuth providers, e.g. { google: "1234567890", github: "987654" }
    providers: {
      google: { type: String, default: null },
      github: { type: String, default: null },
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Prevent password hash from ever leaking even if select() is overridden
userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    email: this.email,
    name: this.name,
    role: this.role,
    avatarUrl: this.avatarUrl,
    createdAt: this.createdAt,
  };
};

export const User = mongoose.model("User", userSchema);