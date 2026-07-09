import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { adminDb } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email-service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { profile } = await getAuthenticatedUser(request);

    if (profile.role !== 'admin' && profile.role !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { subject, message, sendToAll, selectedUserIds } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    if (!sendToAll && (!selectedUserIds || selectedUserIds.length === 0)) {
      return NextResponse.json({ error: 'Either sendToAll must be true or selectedUserIds must be provided' }, { status: 400 });
    }

    console.log('=== BULK EMAIL SENDING STARTED ===');
    console.log('Send to All:', sendToAll);
    console.log('Selected User IDs:', selectedUserIds?.length || 0);
    console.log('Subject:', subject);
    console.log('=====================================');

    // Fetch users to send emails to
    let usersSnapshot;
    if (sendToAll) {
      usersSnapshot = await adminDb.collection('users').where('status', '==', 'active').get();
      console.log('Fetched all active users:', usersSnapshot.size);
    } else {
      // Fetch specific users
      const userPromises = selectedUserIds.map((uid: string) => adminDb.collection('users').doc(uid).get());
      const userDocs = await Promise.all(userPromises);
      usersSnapshot = {
        size: userDocs.length,
        docs: userDocs.filter(doc => doc.exists),
      } as any;
      console.log('Fetched selected users:', usersSnapshot.size);
    }

    const users = usersSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    const emails = users.map((user: any) => user.email).filter((email: string) => email);

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No valid email addresses found' }, { status: 400 });
    }

    console.log('Total emails to send:', emails.length);

    // Create email HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject} - SkyTech</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #020617 0%, #1e293b 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .content {
            padding: 30px;
          }
          .message {
            white-space: pre-wrap;
            color: #334155;
            font-size: 16px;
          }
          .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          .footer a {
            color: #0ea5e9;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SkyTech</h1>
          </div>
          <div class="content">
            <div class="message">${message}</div>
          </div>
          <div class="footer">
            <p>Thank you for being part of SkyTech!</p>
            <p>If you have any questions, please contact us at <a href="mailto:contact@theskytechnology.in">contact@theskytechnology.in</a></p>
            <p style="margin-top: 10px;">© ${new Date().getFullYear()} SkyTech. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send emails sequentially to avoid overwhelming the SMTP server
    const results = {
      total: emails.length,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const email of emails) {
      try {
        const result = await sendEmail({
          to: email,
          subject: `${subject} - SkyTech`,
          html: emailHtml,
          provider: 'contact',
        });

        if (result.success) {
          results.sent++;
          console.log(`✅ Email sent to: ${email}`);
        } else {
          results.failed++;
          results.errors.push(`${email}: ${result.error}`);
          console.error(`❌ Failed to send email to ${email}:`, result.error);
        }
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`${email}: ${errorMsg}`);
        console.error(`❌ Error sending email to ${email}:`, error);
      }
    }

    console.log('=== BULK EMAIL SENDING COMPLETED ===');
    console.log('Total:', results.total);
    console.log('Sent:', results.sent);
    console.log('Failed:', results.failed);
    console.log('=====================================');

    // Log bulk email activity to Firestore
    const bulkEmailLogRef = adminDb.collection('bulkEmailLogs').doc();
    await bulkEmailLogRef.set({
      id: bulkEmailLogRef.id,
      sentBy: profile.uid,
      sentByEmail: profile.email,
      subject,
      message,
      sendToAll,
      selectedUserIds: selectedUserIds || [],
      totalRecipients: results.total,
      sentCount: results.sent,
      failedCount: results.failed,
      errors: results.errors,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: `Bulk email sent to ${results.sent} recipients`,
      results,
    });
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send bulk email' },
      { status: 500 }
    );
  }
}
