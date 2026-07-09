# Email Notification System Setup Guide

## Problem
Customers were not receiving email notifications for:
- Order confirmation after purchase
- Order status updates (Processing, Shipped, Delivered, Cancelled)

## Root Cause
The email service code was implemented but the Zoho SMTP credentials were not configured in environment variables, causing emails to fail silently.

## Solution

### 1. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Zoho SMTP Configuration (shared)
ZOHO_SMTP_HOST=smtp.zoho.in
ZOHO_SMTP_PORT=465
ZOHO_SMTP_SECURE=true

# Order Email Provider (for order-related emails)
ORDER_EMAIL=order@theskytechnology.in
ORDER_EMAIL_PASSWORD=your_order_email_password
ORDER_SMTP_FROM=Sky Tech <order@theskytechnology.in>

# Contact Email Provider (for contact form and bulk messages)
CONTACT_EMAIL=contact@theskytechnology.in
CONTACT_EMAIL_PASSWORD=your_contact_email_password
CONTACT_SMTP_FROM=Sky Tech <contact@theskytechnology.in>
```

### 2. Get Zoho SMTP Credentials

1. Log in to your Zoho Mail account
2. Go to Settings → Mail Accounts
3. Find "SMTP" or "Outgoing Server" settings
4. Generate an App Password (if using 2FA) or use your regular password
5. Note down:
   - SMTP Host: smtp.zoho.in
   - SMTP Port: 465 (SSL) or 587 (TLS)
   - Username: Your full Zoho email address
   - Password: Your App Password or regular password

**Note**: You need two separate Zoho email accounts:
- One for order-related emails (ORDER_EMAIL)
- One for contact form and bulk messages (CONTACT_EMAIL)

### 3. Test Email Configuration

After setting up the environment variables, test the email service:

```bash
# Test email endpoint (admin only)
POST /api/admin/test-email
{
  "testEmail": "your-email@example.com"
}
```

Or check the server logs when creating an order - you should see:
```
=== EMAIL SERVICE CONFIGURATION ===
SMTP Host: smtp.zoho.com
SMTP Port: 465
SMTP Secure: true
SMTP User configured: true
SMTP Pass configured: true
SMTP From: SkyTech <noreply@skytech.com>
=====================================
✅ Email transporter created successfully
```

### 4. Email Implementation Details

#### Order Confirmation Email
- **Location**: `lib/server-checkout.ts` (lines 274-286)
- **Trigger**: After successful payment verification and order creation
- **Template**: `getOrderStatusEmailTemplate(order, 'pending')`
- **Subject**: `Order Confirmed - {orderNumber}`

#### Order Status Update Email
- **Location**: `app/api/admin/orders/update-status/route.ts` (lines 102-106)
- **Trigger**: When admin changes order status
- **Template**: `getOrderStatusEmailTemplate(order, status)`
- **Subject**: `Order {Status} - SkyTech`

### 5. Enhanced Logging

The email service now includes detailed logging:
- Configuration status on initialization
- Email sending attempts with recipient and subject
- Success/failure status with error details
- SMTP response information

### 6. Error Handling

- Email failures do NOT prevent order creation
- Errors are logged to console
- Email logs are stored in Firestore `emailLogs` collection
- Notifications are stored in Firestore `notifications` collection

### 7. Email Templates

Email templates are located in `lib/email-service.ts`:
- `getOrderStatusEmailTemplate()` - Order status updates
- `getReturnApprovedEmailTemplate()` - Return approvals
- `getReplacementApprovedEmailTemplate()` - Replacement approvals

### 8. Troubleshooting

#### Emails not sending
1. Check server logs for "EMAIL SERVICE CONFIGURATION" section
2. Verify all required environment variables are set
3. Test email using `/api/admin/test-email` endpoint
4. Check spam folder
5. Verify Zoho SMTP credentials are correct

#### Authentication errors
- Ensure Zoho SMTP credentials are correct
- If using 2FA, generate an App Password instead of regular password
- Check if Zoho account has SMTP access enabled

#### Connection errors
- Verify SMTP host and port are correct
- Check if firewall blocks SMTP connections
- Ensure secure setting matches port (465 = true, 587 = false)

### 9. Files Modified

1. **lib/email-service.ts**
   - Added detailed configuration logging
   - Added email sending process logging
   - Added error details logging

2. **app/api/admin/test-email/route.ts** (NEW)
   - Admin-only endpoint to test email configuration
   - Sends test email to specified address

### 10. Verification

After setup, verify emails are working:
1. Create a test order
2. Check server logs for email sending logs
3. Verify customer receives order confirmation email
4. Update order status as admin
5. Verify customer receives status update email
