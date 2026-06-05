import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { getEmailDebugInfo } from '@/lib/email-service';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  console.log('=== EMAIL DEBUG ENDPOINT START ===');
  
  try {
    console.log('Step 1: Import check passed');
    
    console.log('Step 2: Authenticating user');
    const { profile } = await getAuthenticatedUser(request);
    console.log('Step 2: User authenticated', profile.email);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      console.log('Step 3: Access denied - not admin/editor');
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }
    console.log('Step 3: Access granted - user is admin/editor');

    console.log('Step 4: Calling getEmailDebugInfo');
    const debugInfo = await getEmailDebugInfo();
    console.log('Step 4: getEmailDebugInfo returned successfully');

    console.log('=== EMAIL DEBUG ENDPOINT SUCCESS ===');
    return NextResponse.json({
      success: true,
      debugInfo,
    });
  } catch (error) {
    console.error('=== EMAIL DEBUG ERROR ===');
    console.error('ERROR:', error);
    console.error('MESSAGE:', error instanceof Error ? error.message : String(error));
    console.error('STACK:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('TYPE:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('==========================');
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 }
    );
  }
}
