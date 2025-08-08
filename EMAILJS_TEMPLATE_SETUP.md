# EmailJS Template Setup Instructions

## Step 1: Create the Template in EmailJS

1. Log into your EmailJS account
2. Go to "Email Templates" in the sidebar
3. Click "Create New Template"

## Step 2: Configure Template Settings

### Basic Settings:
- **Template Name**: `Booking Request Template` (or any name you prefer)
- **Template ID**: This will be auto-generated (copy this for your app.js file)

### Email Settings:
- **To Email**: Set this to your email or use `{{to_email}}` if you want it dynamic
- **From Name**: `{{from_name}}`
- **From Email**: Your email service's default (not the guest's email due to spam filters)
- **Reply To**: `{{from_email}}` (This ensures replies go to the guest)
- **Subject**: `Booking Request - {{apartment_name}} ({{check_in}} to {{check_out}})`

## Step 3: Set the Email Content

### For HTML Content:
1. In the EmailJS template editor, switch to "HTML" mode
2. Copy the entire HTML section from `emailjs-template.html` 
3. Paste it into the content editor

### For Plain Text Fallback:
1. Switch to "Text" mode
2. Copy the plain text version (at the bottom of emailjs-template.html)
3. Paste it into the text content editor

## Step 4: Configure Auto-Reply (Optional)

You can set up an auto-reply to guests:

1. Enable "Auto-Reply" in the template settings
2. Set "Reply To" as `{{from_email}}`
3. Create a simple confirmation message:

```
Subject: Booking Request Received - Haus Säuling

Dear {{from_name}},

Thank you for your booking request for {{apartment_name}} from {{check_in}} to {{check_out}}.

We have received your request and will respond within 24 hours to confirm availability.

Booking Summary:
- Apartment: {{apartment_name}}
- Check-in: {{check_in}}
- Check-out: {{check_out}}
- Total Nights: {{nights}}
- Total Price: {{total}} (excluding tourist tax)

If you have any urgent questions, please call us at +49 (0)176-530 18008.

Best regards,
Christine & Roland Pfeiffer
Haus Säuling
```

## Step 5: Test Your Template

1. Click "Test It" in the template editor
2. Fill in test values for all variables
3. Send a test email to yourself
4. Verify the email looks correct

## Step 6: Save and Get Template ID

1. Click "Save" 
2. Copy your Template ID (shown at the top)
3. Update your `app.js` file with this Template ID

## Available Variables Reference

These are all the variables sent from the booking form:

- `{{to_email}}` - Recipient email (your email)
- `{{from_name}}` - Guest's name
- `{{from_email}}` - Guest's email
- `{{phone}}` - Guest's phone (or "Not provided")
- `{{apartment_name}}` - Selected apartment name
- `{{adults}}` - Number of adults
- `{{children}}` - Number of children
- `{{check_in}}` - Check-in date
- `{{check_out}}` - Check-out date
- `{{nights}}` - Total number of nights
- `{{nightly_rate}}` - Price per night
- `{{cleaning_fee}}` - Cleaning fee
- `{{subtotal}}` - Subtotal amount
- `{{total}}` - Total amount
- `{{message}}` - Guest's message (or "No additional message")
- `{{booking_date}}` - Date when booking was submitted

## Troubleshooting

- **Variables not replaced**: Make sure variable names match exactly (case-sensitive)
- **Email not sending**: Check your service configuration and daily limits
- **Formatting issues**: Use the HTML template for better formatting
- **Reply-to not working**: Some email providers override this - check your service settings