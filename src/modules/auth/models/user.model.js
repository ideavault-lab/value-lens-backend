import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // ========================================
    // BASIC INFORMATION
    // ========================================

    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // ========================================
    // AUTHENTICATION
    // ========================================

    password: {
      type: String,
      select: false,
      default: null,
    },

    provider: {
      type: String,
      enum: ["credentials", "google", "github"],
      default: "credentials",
    },

    providers: {
      google: {
        type: String,
        default: null,
      },

      github: {
        type: String,
        default: null,
      },
    },

    // ========================================
    // PROFILE
    // ========================================

    avatarUrl: {
      type: String,
      default: null,
    },

    // ========================================
    // ACCOUNT
    // ========================================

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ========================================
// VIRTUAL
// ========================================

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ========================================
// SAFE OBJECT
// ========================================

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: this.fullName,
    email: this.email,
    avatarUrl: this.avatarUrl,
    role: this.role,
    provider: this.provider,
    isVerified: this.isVerified,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = mongoose.model("User", userSchema);