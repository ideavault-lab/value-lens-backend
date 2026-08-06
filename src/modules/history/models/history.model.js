import mongoose from "mongoose";

const { Schema } = mongoose;

const historySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // The vehicle details that were submitted for valuation
    input: {
      type: Schema.Types.Mixed,
      required: true,
    },
    // The prediction/valuation result returned to the user
    result: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

// Most recent first, scoped per user
historySchema.index({ user: 1, createdAt: -1 });

export const ValuationHistory = mongoose.model("ValuationHistory", historySchema);