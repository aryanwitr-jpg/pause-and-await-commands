import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set. Email notifications will be disabled.");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface BookingEmailParams {
  event_title: string;
  event_date: string;
  tickets_count: number;
  guest_emails: string[];
  user_email?: string;
}

export async function sendBookingConfirmationEmail(params: BookingEmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SendGrid API key not configured. Skipping email notification.");
    return false;
  }

  try {
    const { event_title, event_date, tickets_count, guest_emails, user_email } = params;
    
    const eventDateFormatted = new Date(event_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailContent = `
      <h2>Event Booking Confirmation</h2>
      <p>Your booking for <strong>${event_title}</strong> has been confirmed!</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Event Details:</h3>
        <p><strong>Event:</strong> ${event_title}</p>
        <p><strong>Date & Time:</strong> ${eventDateFormatted}</p>
        <p><strong>Tickets:</strong> ${tickets_count}</p>
      </div>
      
      ${guest_emails.length > 0 ? `
        <p>Guest invitations have been sent to:</p>
        <ul>
          ${guest_emails.map(email => `<li>${email}</li>`).join('')}
        </ul>
      ` : ''}
      
      <p>Thank you for joining our sustainability initiative!</p>
      <p>Best regards,<br>The ImpactBoard Team</p>
    `;

    const emails = [];
    
    // Send confirmation to main user if email provided
    if (user_email) {
      emails.push({
        to: user_email,
        from: 'noreply@impactboard.com',
        subject: `Booking Confirmed: ${event_title}`,
        html: emailContent,
      });
    }

    // Send invitations to guests
    guest_emails.forEach(guestEmail => {
      emails.push({
        to: guestEmail,
        from: 'noreply@impactboard.com',
        subject: `You're Invited: ${event_title}`,
        html: `
          <h2>You're Invited to ${event_title}</h2>
          <p>You've been invited to attend <strong>${event_title}</strong>!</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Event Details:</h3>
            <p><strong>Event:</strong> ${event_title}</p>
            <p><strong>Date & Time:</strong> ${eventDateFormatted}</p>
          </div>
          
          <p>This is a sustainability-focused event as part of our environmental impact initiative.</p>
          <p>We look forward to seeing you there!</p>
          <p>Best regards,<br>The ImpactBoard Team</p>
        `,
      });
    });

    await mailService.send(emails);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}