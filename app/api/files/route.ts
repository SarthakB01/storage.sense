import clientPromise from '@/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(); // Use the default database
    const collection = db.collection('dummy-collection'); // Dummy collection (replace later)

    // For testing, try creating a dummy document in your database
    const dummyData = { message: 'Hello from MongoDB!' };
    await collection.insertOne(dummyData);

    // Return the data as a JSON response
    return new Response(JSON.stringify({ success: true, message: 'Test data inserted' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
