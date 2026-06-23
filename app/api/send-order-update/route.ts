import { NextRequest, NextResponse } from 'next/server';
import { sendOrderStatusEmail, OrderEmailData, OrderStatus } from '@/lib/sendOrderEmail';

// POST endpoint to send order status update email
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { orderId, customerName, customerEmail, status, orderDate, estimatedDelivery } = body;

    // Validate required fields
    if (!orderId || !customerName || !customerEmail || !status || !orderDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: orderId, customerName, customerEmail, status, orderDate' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer email format' },
        { status: 400 }
      );
    }

    // Prepare email data
    const emailData: OrderEmailData = {
      orderId,
      customerName,
      customerEmail,
      status,
      orderDate,
      estimatedDelivery: estimatedDelivery || undefined,
    };

    // Send email
    const result = await sendOrderStatusEmail(emailData);

    if (result.success) {
      return NextResponse.json(
        { 
          success: true, 
          message: `Order status email sent successfully to ${customerEmail}`,
          orderId,
          status,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to send email',
          orderId,
          status,
        },
        { status: 200 } // Return 200 even if email fails to not break order updates
      );
    }
  } catch (error) {
    console.error('Error in send-order-update API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 200 } // Return 200 even on error to not break order updates
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json(
    { 
      success: true, 
      message: 'Order update email service is running',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
