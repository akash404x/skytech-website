import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { approveRequest } from '@/lib/approval-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, adminUid, adminName } = body;

    if (!requestId || !adminUid || !adminName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const result = await approveRequest(requestId, adminUid, adminName);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in approve API route:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
