import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { sendEmail } from '@/lib/email-service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { testEmail } = body;

    if (!testEmail) {
      return NextResponse.json({ error: 'Test email address is required' }, { status: 400 });
    }

    const testHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Test - SkyTech</title>
      </head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Email Test Successful</h1>
        <p>This is a test email from SkyTech email service.</p>
        <p>If you received this email, your email configuration is working correctly.</p>
        <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
      </body>
      </html>
    `;

    const result = await sendEmail({
      to: testEmail,
      subject: 'Email Test - SkyTech',
      html: testHtml,
    });

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully' : 'Failed to send test email',
      error: result.error,
    });
  } catch (error) {
    console.error('Email test failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to test email' },
      { status: 500 }
    );
  }
}
