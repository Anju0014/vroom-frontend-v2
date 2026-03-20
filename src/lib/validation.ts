
import {z} from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

export const signupSchema=z.object({

    fullName:z
        .string()
        .nonempty({message:"Full name is required"})
        .trim()
        .min(3,{message:"Name must be at least 3 characters"})
        .regex(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces" }),
   
    email:z
        .string()
        .nonempty({message:"Email is required"})
        .trim()
        .email({message:"Invalid email format"}),

    password:z
        .string()
        .nonempty({message:"Password is required"})
        .trim()
        .min(6, { message: "Password must be at least 6 characters" })
        .regex(passwordRegex, {
          message: "Password must contain at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character",
        }),
    
    confirmPassword:z
        .string()
        .nonempty({message:"Confirm Password is required"}),
    
    phoneNumber:z
        .string()
        .nonempty({message:"Phone NUmber is required"})
        .regex(/^\d{10}$/,{message:"Phone number is required"}),
})
.refine((data)=>data.password===data.confirmPassword,{
    message:"Passwords do not match",
    path:["confirmPassword"]
})

export const loginSchema=z.object({
    email:z
        .string()
        .nonempty({message:"Email is requuired"})
        .trim()
        .email({message:"Invalid email format"}),

    password:z
        .string()
        .nonempty({message:"Password is required"})
        .trim()
        .min(6, { message: "Password must be at least 6 characters" }),

})

export const emailSchema = z.string().email({ message: "Invalid email format" });



export const resetPasswordSchema = z.object({
    newPassword: z
      .string()
      .nonempty({ message: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters" })
      .regex(passwordRegex, {
        message: "Password must contain at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character",
      }),
    
    confirmPassword: z
    .string()
    .nonempty({ message: "Confirm Password is required" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Error will show under confirmPassword
  });


const addressSchema = z.object({
    addressLine1: z.string().min(1, "Address Line 1 is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(5, "Postal Code must be at least 5 characters"),
    country: z.string().min(1, "Country is required"),
  });
  
  
  export const profileSchema = z.object({
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    address: addressSchema,
    profileImage: z.string().url("Invalid image URL").optional(),
  });

  export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" })
      .regex(passwordRegex, {
        message: "Password must contain at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  export const carSchema = z.object({
    carName: z.string().nonempty({ message: "Car Name is required" }).trim(),
    brand: z.string().nonempty({ message: "Brand is required" }).trim(),
    year: z
      .string()
      .nonempty({ message: "Year is required" })
      .regex(/^\d{4}$/, { message: "Year must be a 4-digit number" }),
    carType: z.string().nonempty({ message: "Car Type is required" }).trim(),
    fuelType: z.string().nonempty({ message: "Fuel Type is required" }).trim(),
    rcBookNo: z.string().nonempty({ message: "RC Book No is required" }).trim(),
    expectedWage: z
      .string()
      .nonempty({ message: "Expected Wage is required" })
      .regex(/^\d+$/, { message: "Expected Wage must be a number" }),
  
    location: z.object({
      address: z.string().optional(),
      landmark: z.string().optional(),
      coordinates: z.object({
        lat: z.number({
          required_error: "Latitude is required",
          invalid_type_error: "Latitude must be a number",
        }),
        lng: z.number({
          required_error: "Longitude is required",
          invalid_type_error: "Longitude must be a number",
        }),
      }),
    }),
  
    images: z
      .array(z.string().url({ message: "Invalid image URL" }))
      .min(1, { message: "At least one image is required" }),
    videos: z
      .array(z.string().url({ message: "Invalid video URL" }))
      .max(1, { message: "Only one video is allowed" }),
  });
  
  export const ownerRegisterSchema = z.object({
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    altPhoneNumber: z.string().optional(),
    idProof: z.string().nonempty("ID Proof is required"),
    address: z.object({
      addressLine1: z.string().nonempty("Address is required"),
      city: z.string().nonempty("City is required"),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().nonempty("Country is required"),
    }),
  });



  export const complaintSchema = z.object({
    bookingId: z
      .string()
      .nonempty({ message: "Booking ID is required" })
      .trim()
      .min(5, { message: "Booking ID must be valid" }),

    category: z.enum(["car", "payment", "app", "behavior", "other"], {
      required_error: "Category is required",
    }),

    title: z
      .string()
      .nonempty({ message: "Title is required" })
      .trim()
      .min(5, { message: "Title must be at least 5 characters" }),

    description: z
      .string()
      .nonempty({ message: "Description is required" })
      .trim()
      .min(10, { message: "Description must be at least 10 characters" }),

    complaintProof: z
      .string()
      .optional(), 
  });