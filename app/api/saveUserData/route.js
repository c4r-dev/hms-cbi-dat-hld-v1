import clientPromise from "../../../lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const data = await request.json();
    const client = await clientPromise;
    const db = client.db("c4r"); // Replace with your database name
    const collection = db.collection("datahold1"); // Collection to store user data

    await collection.insertOne(data);

    return NextResponse.json({ message: "User data saved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error saving user data:", error);
    return NextResponse.json({ error: "Failed to save user data" }, { status: 500 });
  }
}
