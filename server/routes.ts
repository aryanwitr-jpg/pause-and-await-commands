import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendBookingConfirmationEmail } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  // Email notification endpoint
  app.post("/api/send-booking-email", async (req, res) => {
    try {
      const { event_title, event_date, tickets_count, guest_emails, user_email } = req.body;
      
      const success = await sendBookingConfirmationEmail({
        event_title,
        event_date,
        tickets_count,
        guest_emails,
        user_email
      });
      
      if (success) {
        res.json({ success: true, message: "Emails sent successfully" });
      } else {
        res.status(500).json({ success: false, message: "Failed to send emails" });
      }
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ success: false, message: "Email service error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
