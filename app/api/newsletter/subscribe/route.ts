import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const subscribersRef = collection(db, 'newsletter_subscribers');
    
    await addDoc(subscribersRef, {
      email: email.trim(),
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!'
    });

  } catch (error: any) {
    console.error('Error subscribing to newsletter:');
    console.error('Error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
