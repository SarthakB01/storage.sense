import { NextResponse } from 'next/server';
// import { MongoClient } from 'mongodb';
import clientPromise from '../../mongodb';

export async function POST(request: Request) {
  try {
    const client = await clientPromise; // Wait for MongoDB connection
    const db = client.db();
    const collection = db.collection('users');
    
    const { email, password } = await request.json(); // Get the email and password from request body

    // Check if the user exists in the 'users' collection
    const user = await collection.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Check if the password matches
    if (user.password !== password) {
      return NextResponse.json({ success: false, message: 'Incorrect password' }, { status: 401 });
    }

    return NextResponse.json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ success: false, message: 'Login failed' }, { status: 500 });
  }
}
