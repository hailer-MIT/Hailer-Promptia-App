import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import User from "@models/user";
import { connectToDB } from "@utils/database";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      client: {
        httpOptions: {
          timeout: 10000, // 10 seconds
        },
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async session({ session }) {
      try {
        // store the user id from MongoDB to session
        const sessionUser = await User.findOne({ email: session.user.email });
        session.user.id = sessionUser._id.toString();

        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        return session;
      }
    },
    async signIn({ account, profile, user, credentials }) {
      console.log("SignIn attempt for:", profile?.email || "No profile");
      try {
        console.log("SignIn attempt for:", profile?.email);

        await connectToDB();

        // check if user already exists
        const userExists = await User.findOne({ email: profile.email });

        // if not, create a new document and save user in MongoDB
        if (!userExists) {
          // Generate a valid username from the profile name
          let username = profile.name
            .replace(/\s+/g, "") // Remove ALL spaces
            .replace(/[^a-zA-Z0-9._]/g, "") // Remove non-alphanumeric chars except dots and underscores
            .toLowerCase();

          // If username is too long, truncate it
          if (username.length > 20) {
            username = username.substring(0, 20);
          }

          // If username is too short, add some characters from email
          if (username.length < 3) {
            const emailPart = profile.email.split("@")[0];
            username = username + emailPart.substring(0, 3);
          }

          // Ensure username is at least 3 characters
          while (username.length < 3) {
            username += "1";
          }

          await User.create({
            email: profile.email,
            username: username,
            image: profile.picture,
          });
          console.log(
            "New user created:",
            profile.email,
            "with username:",
            username
          );
        } else {
          console.log("Existing user found:", profile.email);
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error.message);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
