/**
 * GOOGLE CALENDAR & MEET SERVICE
 * Handles Google OAuth, Calendar events, and Meet link generation
 */

const { google } = require('googleapis');

class GoogleService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/tutor/google/callback'
    );
  }

  /**
   * Generate OAuth URL for tutor to authorize
   */
  getAuthUrl(tutorId) {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: tutorId, // Pass tutorId to identify the tutor in callback
      prompt: 'consent' // Force consent to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokens(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  /**
   * Set credentials for API calls
   */
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken) {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }

  /**
   * Create a Google Calendar event with Meet link
   */
  async createMeetingEvent({ tutor, student, scheduledAt, duration, topic, description, timezone = 'UTC' }) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const startDateTime = new Date(scheduledAt);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

    const event = {
      summary: `Tutoring: ${topic}`,
      description: description || `Tutoring session with ${student.name}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: timezone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: timezone,
      },
      attendees: [
        { email: tutor.email, displayName: tutor.name },
        { email: student.email, displayName: student.name }
      ],
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 } // 30 min before
        ]
      }
    };

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all' // Send email invites to attendees
      });

      return {
        eventId: response.data.id,
        meetingLink: response.data.hangoutLink,
        htmlLink: response.data.htmlLink
      };
    } catch (error) {
      console.error('Error creating Google Calendar event:', error.message);
      throw new Error('Failed to create Google Meet meeting');
    }
  }

  /**
   * Update existing calendar event
   */
  async updateMeetingEvent(eventId, updates) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    try {
      const response = await calendar.events.patch({
        calendarId: 'primary',
        eventId,
        resource: updates,
        sendUpdates: 'all'
      });

      return {
        eventId: response.data.id,
        meetingLink: response.data.hangoutLink,
        htmlLink: response.data.htmlLink
      };
    } catch (error) {
      console.error('Error updating Google Calendar event:', error.message);
      throw new Error('Failed to update Google Meet meeting');
    }
  }

  /**
   * Delete calendar event
   */
  async deleteMeetingEvent(eventId) {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all'
      });
      return true;
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error.message);
      return false;
    }
  }

  /**
   * Check if tokens are valid
   */
  async verifyTokens(tokens) {
    try {
      this.setCredentials(tokens);
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      await calendar.calendarList.list({ maxResults: 1 });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new GoogleService();
