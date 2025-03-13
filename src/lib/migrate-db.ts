import { CollectionInfo } from "mongodb";
import mongoose from "mongoose";

export async function resetAndCreateCollections() {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    const db = mongoose.connection;
    const collections: Pick<CollectionInfo, "name" | "type">[] = await db.listCollections();
    const collectionNames = collections.map(col => col.name);

    const collectionNamesToReset = ["user", "session", "account", "verification"];
    
    for (const name of collectionNamesToReset) {
        if (collectionNames.includes(name)) {
            await db.collection(name).deleteMany({});
            console.log(`Collection '${name}' has been emptied.`);
        } else {
            await db.createCollection(name);
            console.log(`Collection '${name}' has been created.`);
        }
    }

    // Ensure indexes are recreated
    await db.collection("user").createIndex({ email: 1 }, { unique: true });
    await db.collection("session").createIndex({ userId: 1 });
    await db.collection("account").createIndex({ userId: 1 });
    await db.collection("account").createIndex({ accountId: 1, providerId: 1 }, { unique: true });
    await db.collection("verification").createIndex({ identifier: 1, value: 1 }, { unique: true });

    console.log("Collections have been reset and recreated with indexes.");
    await mongoose.disconnect();
}