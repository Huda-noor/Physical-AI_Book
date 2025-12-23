import { betterAuth } from "better-auth";

// Define user profile fields for our educational platform
interface UserProfile {
  softwareBackground: string; // beginner, intermediate, advanced
  programmingLanguages: string[]; // list of programming languages known
  roboticsExperience: string; // none, simulation-only, real hardware
  hardwareAccess: string[]; // GPU, Jetson, robot kits, none
}

// Extend the default user model with our profile fields
declare module "better-auth" {
  interface User {
    profile?: UserProfile;
  }
}

export const auth = betterAuth({
  database: {
    provider: "sqlite",
    url: process.env.DATABASE_URL || "./sqlite.db",
  },
  // Define custom fields for user profile
  user: {
    schema: {
      profile: {
        type: "JSON",
        required: false,
      },
    },
  },
  socialProviders: {
    // Add social providers as needed
  },
});