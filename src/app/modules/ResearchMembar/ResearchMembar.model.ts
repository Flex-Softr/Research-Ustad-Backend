import { Schema, model } from 'mongoose';
import { IResearchMembar } from './ResearchMembar.interface';
const ResearchMembarSchema = new Schema<IResearchMembar>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, 'User id is required'],
      unique: true,
      ref: 'User',
    },
    profileImg: { type: String, default: '' },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
      },
      contactNo: { type: String, default: '' },
    fullName: { type: String, default: '' }, 
    designation:  { 
      type: String, 
      enum: {
          values: ["Advisor" , "Lead" , "Mentor_Panel" , "Lead_Research_Associate" , "Research_Associate"], 
          message: "Status must be either Advisor | Lead | Mentor_Panel | Lead_Research_Associate | Research_Associate"
      },
  },
    current: 
      {
        institution: { type: String, default: '' },
        department: { type: String, default: '' },
        degree: { type: String, default: '' },
        inst_designation: { type: String, default: '' },
      },

    education: 
      {
        degree: { type: String, default: '' },
        field: { type: String, default: '' },
        institution: { type: String, default: '' },
        status: { type: String, enum: ["Ongoing", "Completed"] },
        scholarship: { type: String , default:''},
      },
  
    research: [{ type: String }],
    shortBio: { type: String,default:'' }, 
    socialLinks: {
      researchgate: { type: String,default:'' },
      google_scholar: { type: String, default:'' },
      linkedin: { type: String,default:'' },
    },
    
    expertise: [{ type: String, default: [] }],
    
    awards: [{ type: String, default: [] }],
    
    conferences: [{
      name: { type: String, default: '' },
      role: { type: String, default: '' },
      topic: { type: String, default: '' },
    }],

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
  },
);


ResearchMembarSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

ResearchMembarSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

ResearchMembarSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

ResearchMembarSchema.statics.isUserExists = async function (email: string) {
  const existingUser = await ResearchMembar.findOne({ email});
  return existingUser;
};

export const ResearchMembar = model<IResearchMembar>('ResearchMembar', ResearchMembarSchema);


