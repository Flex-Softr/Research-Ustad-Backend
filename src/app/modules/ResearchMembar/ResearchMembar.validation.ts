import { z } from "zod";
// import { z } from "zod";

const createValidationSchema = z.object({
    body:z.object({
        password: z.string().max(20),
        ResearchMembar:z.object({
            email: z.string().email({ message: "Invalid email format." }),
      
            contactNo: z.string().min(10, { message: "Contact number must be at least 10 digits." }),
          
            fullName: z.string().min(1, { message: "Full name is required." }),
          
            designation: z.string().min(1, { message: "Role is required." })
        })
         })
});

const createValidationSchemaJson = z.object({
  body:z.object({
        password: z.string().max(20),
          email: z.string().email({ message: "Invalid email format." }),
    
          contactNo: z.string().min(10, { message: "Contact number must be at least 10 digits." }).optional(),
        
          fullName: z.string().min(1, { message: "Full name is required." }),
        
          designation: z.string().min(1, { message: "Designation is required." }),
          
          role: z.enum(["admin", "user", "superAdmin"], { invalid_type_error: "Role must be admin, user, or superAdmin" }).optional()
      })
});
const UpdateValidationSchema = z.object({
   body:z.object({
    ResearchMembar:z.object({
        email: z.string().email({ message: "Invalid email format." }).optional(),
  
        contactNo: z.string().min(10, { message: "Contact number must be at least 10 digits." }).optional(),
      
        fullName: z.string().min(1, { message: "Full name is required." }).optional(),
      
        designation: z.string().min(1, { message: "Role is required." }).optional(),
      
        current: 
          z.object({
            institution: z.string().min(1, { message: "Institution name is required." }).optional(),
            department: z.string().min(1, { message: "Department name is required." }).optional(),
            degree: z.string().min(1, { message: "Degree is required." }).optional(),
            inst_designation: z.string().min(1, { message: "Institution designation is required." }).optional(),
          }).optional(),
      
        education: 
          z.object({
            degree: z.string().min(1, { message: "Degree is required." }).optional(),
            field: z.string().min(1, { message: "Field of study is required." }).optional(),
            institution: z.string().min(1, { message: "Institution name is required." }).optional(),
            status: z.enum(["Ongoing", "Completed"], { invalid_type_error: "Status must be 'Ongoing' or 'Completed'." }).optional(),
            scholarship: z.string().optional(),
          }).optional(),
      
        research: z.array(z.string().min(1, { message: "Research field cannot be empty." })).optional(),
      
        shortBio: z.string().min(1, { message: "Short bio is required." }).optional(),
      
        socialLinks: z
          .object({
            google_scholar: z.string().url({ message: "Invalid google_scholar URL." }).optional(),
            researchgate: z.string().url({ message: "Invalid researchgate URL." }).optional(),
            linkedin: z.string().url({ message: "Invalid LinkedIn URL." }).optional(),
          })
          .optional(),
        
        expertise: z.array(z.string().min(1, { message: "Expertise field cannot be empty." })).optional(),
        
        awards: z.array(z.string().min(1, { message: "Award field cannot be empty." })).optional(),
        
        conferences: z.array(z.object({
          name: z.string().min(1, { message: "Conference name is required." }).optional(),
          role: z.string().min(1, { message: "Role is required." }).optional(),
          topic: z.string().min(1, { message: "Topic is required." }).optional(),
        })).optional(),
    })
  
   
  
   })
  });

export const ResearchAssociateValidation={
    createValidationSchema,
    UpdateValidationSchema,
    createValidationSchemaJson
}
