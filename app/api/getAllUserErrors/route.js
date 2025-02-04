import clientPromise from "../../../lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("c4r"); // Ensure correct database
    const collection = db.collection("datahold1");

    // Fetch last 1000 records where error_in_accuracy is between -30 and 30
    const results = await collection
      .find(
        { error_in_accuracy: { $gte: -30, $lte: 30 } }, // 🔹 Keep only values in range
        { projection: { _id: 0 } } // 🔹 Select all fields except `_id`
      )
      .sort({ timestamp: -1 }) // Sort by newest first
      .limit(1000)
      .toArray();

    return NextResponse.json({ errors: results }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}
