/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt from 'bcrypt';
import mongoose, { Schema, model } from 'mongoose';
import config from '../../config';
import { UserStatus } from './user.constant';
import { TUser, UserModel } from './user.interface';

const userSchema = new Schema<TUser, UserModel>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    needsPasswordChange: {
      type: Boolean,
      default: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
      default: "https://via.placeholder.com/300x300?text=User",
    },
    passwordChangedAt: {
      type: Date,
    },
    designation:  { 
      type: String, 
      enum: {
          values: ["Advisor" , "Lead" , "Mentor_Panel" , "Lead_Research_Associate" , "Research_Associate","superAdmin"], 
          message: "Status must be either Advisor | Lead | Mentor_Panel | Lead_Research_Associate | Research_Associate"
      },
  },
    status: {
      type: String,
      enum: UserStatus,
      default: 'in-progress',
    },
    role: { 
      type: String, 
      enum: {
          values: ["admin", "user", "superAdmin"], 
          message: "Status must be either 'admin' or 'user'"
      },
      default: "user" 
  },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Research member specific fields
    contactNo: { type: String, default: '' },
    current: {
      institution: { type: String, default: '' },
      department: { type: String, default: '' },
      degree: { type: String, default: '' },
      inst_designation: { type: String, default: '' },
    },
    education: {
      degree: { type: String, default: '' },
      field: { type: String, default: '' },
      institution: { type: String, default: '' },
      status: { type: String, enum: ["Ongoing", "Completed"] },
      scholarship: { type: String, default: '' },
    },
    research: [{ type: String }],
    shortBio: { type: String, default: '' }, 
    socialLinks: {
      researchgate: { type: String, default: '' },
      google_scholar: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
    expertise: [{ type: String, default: [] }],
    awards: [{ type: String, default: [] }],
    conferences: [{
      name: { type: String, default: '' },
      role: { type: String, default: '' },
      topic: { type: String, default: '' },
    }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this; // doc
  // hashing password and save into DB
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

// set '' after saving password
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

userSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

userSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

userSchema.statics.isUserExistsByCustomId = async function (email: string) {
  return await User.findOne({ email }).select('+password');
};

userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: Date,
  jwtIssuedTimestamp: number,
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const User = (mongoose.models.User as UserModel) || model<TUser, UserModel>('User', userSchema);