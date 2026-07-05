import { handlers } from "@/lib/auth";

// Delegates GET (session/providers/csrf-for-nextauth) and POST (sign
// in/out, callback) to NextAuth's own handlers.
export const { GET, POST } = handlers;
