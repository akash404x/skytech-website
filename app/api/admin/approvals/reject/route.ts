import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { rejectRequest } from '@/lib/approval-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, adminUid, adminName, reason } = body;

    if (!requestId || !adminUid || !adminName || !reason) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const result = await rejectRequest(requestId, adminUid, adminName, reason);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in reject API route:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
