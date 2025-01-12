import { MongoClient } from 'mongodb';

const clientPromise = new MongoClient(process.env.MONGODB_URI!).connect(); // Ensure URI is loaded from environment

export async function GET() {
  try {
    const client = await clientPromise; // Await the connection
    const db = client.db(); // Get the database instance
    const collection = db.collection('dummy-collection'); // Replace with your actual collection

    // Insert dummy data
    const dummyData = { message: 'Hello from MongoDB!' };
    await collection.insertOne(dummyData);

    return new Response(
      JSON.stringify({ success: true, message: 'Test data inserted' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
