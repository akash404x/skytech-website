import { NextResponse } from 'next/server';
import { sanitizeEmailHtml } from '@/lib/sanitize-html';
import { generateSkyTechEmailTemplate, SkyTechEmailData } from '@/lib/skytech-email-template';
import { sendEmail } from '@/lib/email-service';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      recipients, 
      subject, 
      message, 
      heroTitle,
      heroSubtitle,
      heroDescription,
      heroImage,
      ctaButton,
      attachments,
      isHtml = false 
    } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Recipients are required' },
        { status: 400 }
      );
    }

    if (!subject || !subject.trim()) {
      return NextResponse.json(
        { success: false, error: 'Subject is required' },
        { status: 400 }
      );
    }

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Send emails in batches
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    console.log('=== Starting Bulk Email Send ===');
    console.log('Total recipients:', recipients.length);
    console.log('Batch size:', batchSize);
    console.log('Number of batches:', batches.length);

    for (const batch of batches) {
      console.log(`Processing batch of ${batch.length} recipients...`);
      const promises = batch.map(async (recipient: string) => {
        try {
          console.log(`Sending to: ${recipient}`);
          
          const templateData: SkyTechEmailData = {
            subject: subject.trim(),
            recipientName: 'User',
            recipientEmail: recipient,
            content: isHtml ? message : `<p>${message}</p>`,
            heroTitle: heroTitle || undefined,
            heroSubtitle: heroSubtitle || undefined,
            heroDescription: heroDescription || undefined,
            heroImage: heroImage || undefined,
            ctaButton: ctaButton || undefined,
            secondaryCta: undefined,
            offerSection: undefined,
            features: undefined,
            services: undefined,
            products: undefined,
            testimonial: undefined,
            attachments: attachments || undefined,
          };

          const emailHtml = generateSkyTechEmailTemplate(templateData);

          const result = await sendEmail({
            to: recipient,
            subject: subject.trim(),
            html: emailHtml,
          });

          if (result.success) {
            console.log(`✅ Sent to ${recipient}`);
            sentCount++;
          } else {
            console.error(`❌ Failed to send to ${recipient}:`, result.error);
            failedCount++;
            errors.push(`${recipient}: ${result.error}`);
          }
        } catch (error) {
          console.error('Vercel SMTP Error Details:', error);
          failedCount++;
          errors.push(`${recipient}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      });

      await Promise.all(promises);
      console.log(`Batch completed. Sent: ${sentCount}, Failed: ${failedCount}`);
    }

    console.log('=== Bulk Email Send Complete ===');
    console.log('Total sent:', sentCount);
    console.log('Total failed:', failedCount);

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      totalRecipients: recipients.length,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error sending bulk message:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send bulk message' },
      { status: 500 }
    );
  }
}
