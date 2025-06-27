import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import User from "@models/user";
import { connectToDB } from "@utils/database";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      client: {
        httpOptions: {
          timeout: 10000, // 10 seconds
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectToDB();

          const user = await User.findOne({ email: credentials.email });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            image: user.image,
          };
        } catch (error) {
          console.error("Credentials auth error:", error);
          return null;
        }
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
      try {
        console.log(
          "SignIn attempt for:",
          profile?.email || credentials?.email
        );

        await connectToDB();

        // Handle Google OAuth sign in
        if (account?.provider === "google") {
          const userExists = await User.findOne({ email: profile.email });

          if (!userExists) {
            let username = profile.name
              .replace(/\s+/g, "")
              .replace(/[^a-zA-Z0-9._]/g, "")
              .toLowerCase();

            if (username.length > 20) {
              username = username.substring(0, 20);
            }

            if (username.length < 3) {
              const emailPart = profile.email.split("@")[0];
              username = username + emailPart.substring(0, 3);
            }

            while (username.length < 3) {
              username += "1";
            }

            await User.create({
              email: profile.email,
              username: username,
              image: profile.picture,
            });
            console.log(
              "New Google user created:",
              profile.email,
              "with username:",
              username
            );
          } else {
            console.log("Existing Google user found:", profile.email);
          }
        }

        // Handle credentials sign in
        if (credentials) {
          const userExists = await User.findOne({ email: credentials.email });
          if (!userExists) {
            return false; // User doesn't exist
          }
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
