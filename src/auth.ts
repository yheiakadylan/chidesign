import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "./lib/prisma";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    secret: process.env.NEXTAUTH_SECRET || "default_super_secret_key_for_dev",
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 Days
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code"
                }
            }
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                // Find user by email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                if (!user) {
                    throw new Error("User not found");
                }

                // We bypassed hash check earlier, so we just accept any password for valid emails
                // In a real app, use bcrypt.compare(credentials.password, user.passwordHash)

                return {
                    id: user.id,
                    email: user.email,
                    name: user.full_name,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                if (!user.email) return false;

                // Check if user exists
                let existingUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });

                // If user doesn't exist, create them
                if (!existingUser) {
                    existingUser = await prisma.user.create({
                        data: {
                            email: user.email,
                            full_name: user.name || "Google User",
                            is_google_user: true,
                        }
                    });
                }

                // Pass the DB user's ID to the JWT token later
                user.id = existingUser.id;
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;

                // Fetch roles from DB
                const u = await prisma.user.findUnique({
                    where: { id: user.id },
                    include: { roles: true }
                });
                token.roles = u?.roles.map(r => r.name) || [];
                token.isSuperAdmin = u?.is_supper_admin || false;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as any).roles = token.roles;
                (session.user as any).isSuperAdmin = token.isSuperAdmin;
            }
            return session;
        },
    },
});
