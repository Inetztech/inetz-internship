import mongoose, { Schema, model, models, Document } from "mongoose";
import bcrypt from "bcryptjs";

// 1. Define the Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "student" | "admin";
  image?: string;
  provider?: string;
  
  phone?: string;

  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 2. Define the Schema
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { 
      type: String, 
      required: false,
      select: false, // Prevents password from leaking in API queries by default
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    image: { type: String },
    provider: { type: String, default: "credentials" },

    phone: { type: String, trim: true },
  },
  {
    timestamps: true, // Replaces manual createdAt with automatic createdAt & updatedAt tracking
  }
);

/**
 * 3. Pre-save Hook
 * Hashes password when present and modified
 */
UserSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * 4. Instance Method for Password Comparison
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // If query did not explicitly include `.select("+password")`, this.password will be undefined
  if (!this.password) {
    throw new Error("Password field was not selected in query");
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// 5. Export Strategy
const User =
  (models.User as mongoose.Model<IUser>) ||
  model<IUser>("User", UserSchema);

export default User;
