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
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sky Tech Email Test</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          <h1 style="color: #00e5ff; font-size: 32px; margin-bottom: 20px;">Sky Tech Email Test</h1>
          <p style="font-size: 18px; line-height: 1.6;">If you received this email, Zoho SMTP is working correctly.</p>
          <p style="font-size: 16px; color: #94a3b8; margin-top: 30px;">This is an automated test email from Sky Tech.</p>
        </div>
      </body>
      </html>
    `;

    const result = await sendEmail({
      to: testEmail,
      subject: 'Sky Tech Email Test',
      html: testHtml,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${testEmail}`,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to send test email',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    );
  }
}
