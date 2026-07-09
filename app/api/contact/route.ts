import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-provider';

export const runtime = 'nodejs';

// Server-side validation
function validateContactData(data: any) {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.push('Invalid email format');
    }
  }

  if (data.phone && typeof data.phone === 'string' && data.phone.trim()) {
    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
    if (!phoneRegex.test(data.phone.trim())) {
      errors.push('Invalid phone number format');
    }
  }

  if (!data.subject || typeof data.subject !== 'string' || !data.subject.trim()) {
    errors.push('Subject is required');
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters long');
  }

  return errors;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate input
    const validationErrors = validateContactData({ name, email, phone, subject, message });
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Trim all inputs
    const trimmedData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim() || '',
      subject: subject.trim(),
      message: message.trim(),
    };

    // Send email using Email Service with contact provider
    const emailService = EmailService.createContactProvider();
    const verified = await emailService.verify();

    if (!verified) {
      console.error('❌ Email provider verification failed');
      return NextResponse.json(
        { success: false, error: 'Email service not available' },
        { status: 500 }
      );
    }

    // Create email content
    const subjectLabels: Record<string, string> = {
      general: 'General Inquiry',
      support: 'Product Support',
      order: 'Order Related',
      partnership: 'Business Partnership',
      feedback: 'Feedback',
      other: 'Other',
    };

    const emailSubject = `Contact Form: ${subjectLabels[trimmedData.subject] || trimmedData.subject} - ${trimmedData.name}`;
    const toEmail = 'contact@theskytechnology.in';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact Form Submission</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          <h1 style="color: #00e5ff; font-size: 32px; margin-bottom: 20px;">New Contact Form Submission</h1>
          
          <div style="background: rgba(0, 191, 255, 0.1); border-left: 4px solid #00e5ff; padding: 15px; margin-bottom: 30px; border-radius: 8px;">
            <h2 style="color: #00e5ff; font-size: 18px; margin: 0 0 10px 0;">${subjectLabels[trimmedData.subject] || trimmedData.subject}</h2>
            <p style="margin: 0; color: #94a3b8; font-size: 14px;">${new Date().toLocaleString()}</p>
          </div>

          <div style="space-y: 20px;">
            <div style="margin-bottom: 20px;">
              <label style="display: block; color: #00bfff; font-size: 14px; font-weight: bold; margin-bottom: 5px;">Full Name</label>
              <p style="margin: 0; color: #e2e8f0; font-size: 16px;">${trimmedData.name}</p>
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; color: #00bfff; font-size: 14px; font-weight: bold; margin-bottom: 5px;">Email Address</label>
              <p style="margin: 0; color: #e2e8f0; font-size: 16px;">
                <a href="mailto:${trimmedData.email}" style="color: #00e5ff; text-decoration: none;">${trimmedData.email}</a>
              </p>
            </div>

            ${trimmedData.phone ? `
            <div style="margin-bottom: 20px;">
              <label style="display: block; color: #00bfff; font-size: 14px; font-weight: bold; margin-bottom: 5px;">Phone Number</label>
              <p style="margin: 0; color: #e2e8f0; font-size: 16px;">
                <a href="tel:${trimmedData.phone}" style="color: #00e5ff; text-decoration: none;">${trimmedData.phone}</a>
              </p>
            </div>
            ` : ''}

            <div style="margin-bottom: 20px;">
              <label style="display: block; color: #00bfff; font-size: 14px; font-weight: bold; margin-bottom: 5px;">Message</label>
              <div style="background: rgba(15, 23, 42, 0.5); padding: 15px; border-radius: 8px; border: 1px solid rgba(0, 191, 255, 0.2);">
                <p style="margin: 0; color: #e2e8f0; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${trimmedData.message}</p>
              </div>
            </div>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="margin: 0; color: #64748b; font-size: 12px;">This message was sent from the Sky Tech contact form.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const result = await emailService.send({
      to: toEmail,
      subject: emailSubject,
      html: htmlContent,
      replyTo: trimmedData.email,
    });

    if (!result.success) {
      console.error('❌ Failed to send contact email:', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send message' },
        { status: 500 }
      );
    }

    console.log('✅ Contact form email sent successfully:', result.messageId);

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      emailMessageId: result.messageId,
    });

  } catch (error) {
    console.error('❌ Error processing contact form:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process message' 
      },
      { status: 500 }
    );
  }
}
