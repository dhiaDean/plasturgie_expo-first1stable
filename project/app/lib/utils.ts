// Assuming api.types is in a sibling 'services' directory, adjust path if needed
import { Role } from '../services/api.types';
// clsx and tailwind-merge are primarily for web development with Tailwind CSS.
// They are generally not needed for standard React Native StyleSheet styling.
// You can remove these imports and the 'cn' function if you are not using
// a library like NativeWind that bridges Tailwind to React Native.
// import { clsx, type ClassValue } from "clsx"
// import { twMerge } from "tailwind-merge"

/*
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
*/

// This interface is fine, but ensure it's used consistently if needed elsewhere.
// Often, the interface from api.types.ts (RegisterRequest) is sufficient.
export interface RegisterRequestUtil { // Renamed to avoid conflict if imported elsewhere
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: Role;
}

// Add any other React Native specific utils here if needed.
// For example, a helper to get device dimensions, format currency, etc.
// (Though formatting helpers might live elsewhere too).
