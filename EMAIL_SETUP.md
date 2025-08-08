# Email Setup Guide for Haus Säuling Website

The booking form now supports two methods for sending emails:

## Option 1: EmailJS (Recommended) - Free for up to 200 emails/month

EmailJS sends emails directly from the browser without needing a backend server.

### Setup Steps:

1. **Create an EmailJS account**
   - Go to https://www.emailjs.com and sign up for free
   - You get 200 free emails per month

2. **Create an Email Service**
   - In your EmailJS dashboard, go to "Email Services"
   - Click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the instructions to connect your email account
   - Copy the Service ID (looks like: `service_abc123`)

3. **Create an Email Template**
   - Go to "Email Templates" 
   - Click "Create New Template"
   - Set up your template with these variables:
   ```
   Subject: Booking Request - {{apartment_name}}
   
   From Name: {{from_name}}
   From Email: {{from_email}}
   
   Content:
   New booking request received!
   
   Guest Information:
   - Name: {{from_name}}
   - Email: {{from_email}}
   - Phone: {{phone}}
   
   Booking Details:
   - Apartment: {{apartment_name}}
   - Check-in: {{check_in}}
   - Check-out: {{check_out}}
   - Nights: {{nights}}
   - Adults: {{adults}}
   - Children: {{children}}
   
   Pricing:
   - Nightly Rate: {{nightly_rate}}
   - Cleaning Fee: {{cleaning_fee}}
   - Subtotal: {{subtotal}}
   - Total: {{total}}
   
   Guest Message:
   {{message}}
   
   Booking Date: {{booking_date}}
   ```
   - Copy the Template ID (looks like: `template_xyz789`)

4. **Get your Public Key**
   - Go to "Account" → "General"
   - Copy your Public Key (looks like: `user_123abc...`)

5. **Update the website code**
   - Open `app.js`
   - Replace these lines with your actual values:
   ```javascript
   const EMAILJS_SERVICE_ID = "service_abc123"; // Your actual service ID
   const EMAILJS_TEMPLATE_ID = "template_xyz789"; // Your actual template ID
   const EMAILJS_PUBLIC_KEY = "user_123abc..."; // Your actual public key
   ```

6. **Test it!**
   - Fill out the booking form
   - Click "Request booking"
   - You should see "Sending..." then a success message
   - Check your email for the booking request

## Option 2: Keep using mailto (Current fallback)

If you don't set up EmailJS, the form will automatically fall back to the mailto method, which opens the user's email client.

## Option 3: Other Services

### Formspree (Alternative)
- Sign up at https://formspree.io
- Create a form and get your form ID
- Update the form action in `index.html`:
  ```html
  <form id="bookingForm" class="form" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  ```

### Netlify Forms (If hosting on Netlify)
- Add `data-netlify="true"` to your form
- Netlify will automatically handle form submissions

## Troubleshooting

- **Emails not sending**: Check browser console for errors
- **"Service not found"**: Verify your Service ID is correct
- **"Template not found"**: Verify your Template ID is correct
- **"Unauthorized"**: Check your Public Key is correct
- **Rate limit**: Free plan is limited to 200 emails/month

## Security Note

The EmailJS public key is safe to expose in your frontend code. It can only be used to send emails through your configured templates, not to access your account.