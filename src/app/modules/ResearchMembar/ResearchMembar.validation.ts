import { z } from "zod";
// import { z } from "zod";

const createValidationSchema = z.object({
    body:z.object({
        password: z.string().max(20),
        ResearchMembar:z.object({
            email: z.string().email({ message: "Invalid email format." }),
      
            contactNo: z.string().min(10, { message: "Contact number must be at least 10 digits." }).optional(),
          
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
        email: z.string().email({ message: "Invalid email format." }).optional().or(z.literal("")),
  
        contactNo: z.string().optional().or(z.literal("")),
      
        fullName: z.string().optional().or(z.literal("")),
      
        designation: z.string().optional().or(z.literal("")),
      
        current: 
          z.object({
            institution: z.string().optional().or(z.literal("")),
            department: z.string().optional().or(z.literal("")),
            degree: z.string().optional().or(z.literal("")),
            inst_designation: z.string().optional().or(z.literal("")),
          }).optional(),
      
        education: 
          z.object({
            degree: z.string().optional().or(z.literal("")),
            field: z.string().optional().or(z.literal("")),
            institution: z.string().optional().or(z.literal("")),
            status: z.enum(["Ongoing", "Completed"], { invalid_type_error: "Status must be 'Ongoing' or 'Completed'." }).optional(),
            scholarship: z.string().optional().or(z.literal("")),
          }).optional(),
      
        research: z.array(z.string()).optional(),
      
        shortBio: z.string().optional().or(z.literal("")),
      
        socialLinks: z
          .object({
            google_scholar: z.string().url({ message: "Invalid google_scholar URL." }).optional().or(z.literal("")),
            researchgate: z.string().url({ message: "Invalid researchgate URL." }).optional().or(z.literal("")),
            linkedin: z.string().url({ message: "Invalid LinkedIn URL." }).optional().or(z.literal("")),
          })
          .optional(),
        
        expertise: z.array(z.string()).optional(),
        
        awards: z.array(z.string()).optional(),
        
        conferences: z.array(z.object({
          name: z.string().optional().or(z.literal("")),
          role: z.string().optional().or(z.literal("")),
          topic: z.string().optional().or(z.literal("")),
        })).optional(),
    })
  
   
  
   })
  });

export const ResearchAssociateValidation={
    createValidationSchema,
    UpdateValidationSchema,
    createValidationSchemaJson
}
