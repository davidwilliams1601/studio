// src/lib/calendar-integration.ts
import { SubscriptionTier, getNextReminderDate, getUserTierLimits } from './subscription-tiers';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  reminderMinutes: number[];
  location?: string;
  url?: string;
}

export interface CalendarIntegration {
  provider: 'google' | 'outlook' | 'apple';
  accessToken: string;
  refreshToken?: string;
  calendarId: string;
}

export class CalendarReminderService {
  
  static generateBackupReminderEvent(
    tier: SubscriptionTier,
    lastBackupDate: Date,
    userEmail: string
  ): CalendarEvent {
    const limits = getUserTierLimits(tier);
    const nextBackupDate = getNextReminderDate(tier, lastBackupDate);
    const reminderTitle = this.getReminderTitle(tier);
    const reminderDescription = this.getReminderDescription(tier, nextBackupDate);
    
    // Set reminder for 30 minutes before the suggested time (9:30 AM)
    const reminderDate = new Date(nextBackupDate);
    reminderDate.setHours(9, 30, 0, 0);
    
    const endDate = new Date(reminderDate);
    endDate.setMinutes(endDate.getMinutes() + 30);
    
    return {
      id: `linkedin-backup-${tier}-${nextBackupDate.getTime()}`,
      title: reminderTitle,
      description: reminderDescription,
      startDate: reminderDate,
      endDate: endDate,
      reminderMinutes: this.getReminderIntervals(tier),
      url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    };
  }
  
  private static getReminderTitle(tier: SubscriptionTier): string {
    const limits = getUserTierLimits(tier);
    
    switch (tier) {
      case 'free':
        return '📊 Monthly LinkedIn Data Backup Due';
      case 'pro':
        return '🚀 Weekly LinkedIn Network Analysis';
      case 'business':
        return '💼 Strategic LinkedIn Intelligence Update';
      default:
        return '📈 LinkedIn Data Backup Reminder';
    }
  }
  
  private static getReminderDescription(tier: SubscriptionTier, nextDate: Date): string {
    const limits = getUserTierLimits(tier);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.com';
    
    const baseDescription = `Time to update your LinkedIn data analysis!\n\n`;
    
    const tierSpecificBenefits = {
      free: `📈 Get fresh insights into your network growth
🔍 Basic AI analysis of your connections
📊 Track your monthly networking progress`,
      
      pro: `🧠 Advanced AI insights and strategic recommendations
📈 Weekly network intelligence updates  
🎯 Strategic connection opportunities
📅 Automated calendar integration
💡 Personalized growth action items`,
      
      business: `🏢 Premium network analysis and intelligence
🎯 Advanced strategic recommendations
📊 Comprehensive industry trend analysis
🤝 Team collaboration features
📈 Unlimited backup and analysis
🔮 Predictive career opportunity insights`
    };
    
    return `${baseDescription}${tierSpecificBenefits[tier]}\n\n` +
           `🔗 Quick access: ${appUrl}/dashboard\n` +
           `⏰ This takes just 2-3 minutes\n` +
           `💪 Stay ahead of your professional growth!`;
  }
  
  private static getReminderIntervals(tier: SubscriptionTier): number[] {
    switch (tier) {
      case 'free':
        return [1440, 60]; // 24 hours and 1 hour before
      case 'pro':
        return [10080, 1440, 60]; // 1 week, 1 day, 1 hour before
      case 'business':
        return [10080, 60]; // 1 week and 1 hour before (less nagging)
      default:
        return [1440, 60];
    }
  }
  
  // Google Calendar Integration
  static async createGoogleCalendarEvent(
    event: CalendarEvent,
    accessToken: string,
    calendarId: string = 'primary'
  ): Promise<boolean> {
    try {
      const googleEvent = {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.startDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.endDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        reminders: {
          useDefault: false,
          overrides: event.reminderMinutes.map(minutes => ({
            method: 'popup',
            minutes: minutes
          }))
        },
        source: {
          url: event.url,
          title: 'LinkedIn Analytics Dashboard'
        }
      };
      
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(googleEvent),
        }
      );
      
      return response.ok;
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      return false;
    }
  }
  
  // Generate ICS file for manual calendar import
  static generateICSFile(event: CalendarEvent): string {
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const now = new Date();
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LinkedIn Analytics//Reminder//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@linkedin-analytics.com`,
      `DTSTART:${formatDate(event.startDate)}`,
      `DTEND:${formatDate(event.endDate)}`,
      `DTSTAMP:${formatDate(now)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      ...(event.url ? [`URL:${event.url}`] : []),
      ...event.reminderMinutes.map(minutes => 
        `BEGIN:VALARM\nACTION:DISPLAY\nDESCRIPTION:${event.title}\nTRIGGER:-PT${minutes}M\nEND:VALARM`
      ),
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');
    
    return icsContent;
  }
  
  // Email reminder fallback
  static generateEmailReminder(
    tier: SubscriptionTier,
    userEmail: string,
    nextBackupDate: Date
  ): { subject: string; html: string; text: string } {
    const limits = getUserTierLimits(tier);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.com';
    
    const subject = `${this.getReminderTitle(tier)} - Time to update!`;
    
    const tierColor = {
      free: '#3B82F6',
      pro: '#10B981', 
      business: '#8B5CF6'
    }[tier];
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, ${tierColor} 0%, #1F2937 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚀 LinkedIn Analytics</h1>
          <p style="color: #E5E7EB; margin: 10px 0 0 0;">${limits.name} Plan</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #1F2937; margin-top: 0;">${this.getReminderTitle(tier)}</h2>
          
          <p style="color: #4B5563; line-height: 1.6;">
            It's time to refresh your LinkedIn network analysis! Your ${limits.backupFrequency} update is due.
          </p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1F2937; margin-top: 0;">What you'll get:</h3>
            ${this.getReminderDescription(tier, nextBackupDate)
              .split('\n')
              .filter(line => line.startsWith('•'))
              .map(line => `<p style="margin: 5px 0; color: #4B5563;">${line}</p>`)
              .join('')}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/dashboard" 
               style="background: ${tierColor}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              📊 Update My Analysis
            </a>
          </div>
          
          <p style="color: #6B7280; font-size: 14px; text-align: center;">
            This takes just 2-3 minutes and keeps your insights fresh!
          </p>
        </div>
      </div>
    `;
    
    const text = `
      ${this.getReminderTitle(tier)}
      
      It's time to refresh your LinkedIn network analysis! Your ${limits.backupFrequency} update is due.
      
      ${this.getReminderDescription(tier, nextBackupDate)}
      
      Update now: ${appUrl}/dashboard
    `;
    
    return { subject, html, text };
  }
}
