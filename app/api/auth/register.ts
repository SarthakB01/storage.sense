import { NextResponse } from 'next/server';
// import { MongoClient } from 'mongodb';
import clientPromise from '../../mongodb';

export async function POST(request: Request) {
  try {
    const client = await clientPromise; // Ensure the connection is established
    const db = client.db();
    const collection = db.collection('users');
    
    const { username, email, password } = await request.json();
    
    // Insert user data into the 'users' collection
    await collection.insertOne({ username, email, password });

    return NextResponse.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ success: false, message: 'Registration failed' }, { status: 500 });
  }
}
