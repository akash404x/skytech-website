import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import nodemailer from 'nodemailer';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { testEmail, config } = body;

    if (!testEmail) {
      return NextResponse.json({ error: 'Test email address is required' }, { status: 400 });
    }

    const configs = [
      {
        name: 'Configuration A (Port 465, SSL)',
        host: process.env.ZOHO_SMTP_HOST?.trim() || 'smtp.zoho.in',
        port: 465,
        secure: true,
      },
      {
        name: 'Configuration B (Port 587, STARTTLS)',
        host: process.env.ZOHO_SMTP_HOST?.trim() || 'smtp.zoho.in',
        port: 587,
        secure: false,
      },
    ];

    const results = [];

    for (const smtpConfig of configs) {
      try {
        console.log(`=== Testing ${smtpConfig.name} ===`);
        
        const transporter = nodemailer.createTransport({
          host: smtpConfig.host,
          port: smtpConfig.port,
          secure: smtpConfig.secure,
          auth: {
            user: process.env.ZOHO_EMAIL?.trim(),
            pass: process.env.ZOHO_PASSWORD?.trim(),
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        console.log(`SMTP Host: ${smtpConfig.host}`);
        console.log(`SMTP Port: ${smtpConfig.port}`);
        console.log(`SMTP Secure: ${smtpConfig.secure}`);
        console.log(`SMTP User: ${process.env.ZOHO_EMAIL?.trim()}`);
        console.log(`Password Length: ${process.env.ZOHO_PASSWORD?.trim().length}`);

        // Verify connection
        await new Promise<void>((resolve, reject) => {
          transporter.verify((error, success) => {
            if (error) {
              console.error(`❌ ${smtpConfig.name} Verification Failed:`, error);
              reject(error);
            } else {
              console.log(`✅ ${smtpConfig.name} Connected Successfully`);
              resolve();
            }
          });
        });

        // Send test email
        const testHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Sky Tech SMTP Test</title>
          </head>
          <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; padding: 40px;">
              <h1 style="color: #00e5ff; font-size: 32px;">SMTP Configuration Test</h1>
              <p style="font-size: 18px;">Configuration: ${smtpConfig.name}</p>
              <p style="font-size: 18px;">If you received this email, this configuration works!</p>
            </div>
          </body>
          </html>
        `;

        const info = await transporter.sendMail({
          from: process.env.ZOHO_SMTP_FROM?.trim() || process.env.ZOHO_EMAIL?.trim(),
          to: testEmail,
          subject: `SMTP Test - ${smtpConfig.name}`,
          html: testHtml,
        });

        results.push({
          config: smtpConfig.name,
          success: true,
          messageId: info.messageId,
          error: null,
        });

        console.log(`✅ ${smtpConfig.name} Email sent successfully:`, info.messageId);

      } catch (error: any) {
        console.error(`❌ ${smtpConfig.name} Failed:`, error);
        results.push({
          config: smtpConfig.name,
          success: false,
          messageId: null,
          error: error.message,
          code: error.code,
          response: error.response,
          responseCode: error.responseCode,
          command: error.command,
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    });

  } catch (error) {
    console.error('Error testing SMTP configurations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to test SMTP configurations' },
      { status: 500 }
    );
  }
}
