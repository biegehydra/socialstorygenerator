import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { sendMagicLinkEmail } from "./email";
import { magicLink } from "better-auth/plugins";
const client = new MongoClient(process.env.MONGODB_URI!);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  plugins: [
    magicLink({
        sendMagicLink: async ({ email, url }) => {
            await sendMagicLinkEmail(email, url);
        }
    })
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  }
}); 