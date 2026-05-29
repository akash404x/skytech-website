import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { processMissingRefunds } from '@/lib/refund-service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    console.log('=== ADMIN PROCESS MISSING REFUNDS API START ===');
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      console.error('Admin Process Missing Refunds: Unauthorized access attempt by', profile.uid, 'role:', profile.role);
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    console.log('Admin Process Missing Refunds: Starting refund processing for user', profile.uid);

    // Run the missing refunds processing job
    const result = await processMissingRefunds();

    console.log('=== ADMIN PROCESS MISSING REFUNDS API END ===');
    console.log('Admin Process Missing Refunds: Result:', result);

    return NextResponse.json({
      ...result,
    });
  } catch (error) {
    console.error('=== ADMIN PROCESS MISSING REFUNDS API FAILED ===');
    console.error('Admin Process Missing Refunds: Error details:', error);
    console.error('Admin Process Missing Refunds: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Admin Process Missing Refunds: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('==========================================');
    if (error instanceof Response) return error;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to process missing refunds' }, { status: 500 });
  }
}
