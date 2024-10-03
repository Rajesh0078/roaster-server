// models/Message.js

import mongoose from "mongoose";

const { Schema, model } = mongoose;

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      required: true, // Reference to sender's User ID
    },
    recipient: {
      type: Schema.Types.ObjectId,
      required: true, // Reference to recipient's User ID
    },
    content: {
      type: String,
      required: true, // The actual message content
    },
    seen: {
      type: Boolean,
      default: false, // Flag to mark if the message has been seen
    },
    edited: {
      type: Boolean,
      default: false, // Flag to indicate if the message was edited
    },
    deleted: {
      type: Boolean,
      default: false, // Flag to indicate if the message was deleted
    },
    deletedAt: {
      type: Date, // Timestamp of when the message was deleted
      default: null,
    },
    editedAt: {
      type: Date, // Timestamp of when the message was last edited
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now, // The time the message was sent
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Middleware to update `editedAt` on content changes
messageSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    this.edited = true;
    this.editedAt = Date.now();
  }
  next();
});

export const Message = mongoose.model("Message", messageSchema);
