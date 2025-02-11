const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    companyName: {
      type: String,
      required: function () {
        return this.get("role") === "business"; // ✅ Corrected validation
      },
    },
    gstin: {
      type: String,
      required: function () {
        return this.get("role") === "business"; // ✅ Corrected validation
      },
      validate: {
        validator: function (v) {
          return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid GSTIN!`,
      },
    },
    role: {
      type: String,
      enum: ["individual", "business"],
      default: "individual",
    },
  },
  { timestamps: true } // ✅ Corrected createdAt & updatedAt handling
);

// ✅ Prevents re-hashing if the password is not modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ✅ Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;