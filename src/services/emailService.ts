import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface WelcomeEmailData {
  email: string;
  name: string;
}

export class EmailService {
  static async sendWelcomeEmail({ email, name }: WelcomeEmailData) {
    try {
      console.log('🔄 Starting email send process...');
      console.log('📧 Target email:', email);
      console.log('👤 Name:', name);

      if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY is not set');
        return false;
      }

      if (!email || !name) {
        console.error('❌ Missing email or name:', { email, name });
        return false;
      }

      console.log('🚀 Sending email via Resend with custom domain...');
      
      const { data, error } = await resend.emails.send({
        from: 'LinkStream <noreply@lstream.app>', // Using your custom domain!
        to: [email],
        subject: '🛡️ Welcome to LinkStream - Your LinkedIn is Now Protected!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to LinkStream</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🛡️ Welcome to LinkStream!</h1>
              <p style="color: white; margin: 10px 0 0; font-size: 18px; opacity: 0.9;">Your LinkedIn protection starts now</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #1e293b; margin-top: 0;">Hi ${name}! 👋</h2>
              <p>Congratulations on taking the smart step to protect your professional network! Your LinkStream account is now active and ready to safeguard your LinkedIn data.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
                <h3 style="color: #10b981; margin-top: 0;">🚀 Get Started in 3 Easy Steps:</h3>
                <ol style="padding-left: 20px;">
                  <li><strong>Export your LinkedIn data</strong> - Go to LinkedIn Settings → Data Privacy → Get a copy of your data</li>
                  <li><strong>Upload to LinkStream</strong> - Visit your dashboard and upload the ZIP file</li>
                  <li><strong>Get instant insights</strong> - See your network analysis and backup confirmation</li>
                </ol>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://lstream.app/dashboard" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  📊 Access Your Dashboard
                </a>
              </div>
            </div>
            
            <div style="background: #fff7ed; padding: 20px; border-radius: 8px; border: 1px solid #fed7aa; margin-bottom: 20px;">
              <h3 style="color: #ea580c; margin-top: 0;">💡 Pro Tip</h3>
              <p style="margin-bottom: 0;">Upload your LinkedIn data monthly to track network growth and get the most value from your professional connections!</p>
            </div>
            
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 14px;">
              <p>Need help? Reply to this email or contact <a href="mailto:support@lstream.app" style="color: #3b82f6;">support@lstream.app</a></p>
              <p>Best regards,<br>The LinkStream Team</p>
              <p style="font-size: 12px; margin-top: 20px;">
                LinkStream - Protecting professional networks worldwide<br>
                <a href="https://lstream.app" style="color: #3b82f6;">lstream.app</a>
              </p>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error('❌ Resend API error:', error);
        
        // If custom domain fails, fallback to resend.dev
        if (error.message?.includes('Domain not found') || error.message?.includes('not verified')) {
          console.log('⚠️ Custom domain not ready, using fallback...');
          return await this.sendWelcomeEmailFallback({ email, name });
        }
        
        return false;
      }

      console.log('✅ Email sent successfully with custom domain!');
      console.log('📧 Email ID:', data?.id);
      return true;
    } catch (error) {
      console.error('❌ Exception in email service:', error);
      
      // Fallback to resend.dev if custom domain fails
      console.log('🔄 Attempting fallback email send...');
      return await this.sendWelcomeEmailFallback({ email, name });
    }
  }

  static async sendWelcomeEmailFallback({ email, name }: WelcomeEmailData) {
    try {
      console.log('🔄 Sending welcome email with fallback domain...');
      
      const { data, error } = await resend.emails.send({
        from: 'LinkStream <onboarding@resend.dev>', // Fallback domain
        to: [email],
        subject: '🛡️ Welcome to LinkStream - Your LinkedIn is Now Protected!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1e293b;">🛡️ Welcome to LinkStream!</h1>
            <p>Hi ${name}! 👋</p>
            <p>Congratulations on joining LinkStream! Your LinkedIn protection starts now.</p>
            <p><a href="https://lstream.app/dashboard" style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">📊 Access Your Dashboard</a></p>
            <p>Best regards,<br>The LinkStream Team</p>
          </div>
        `,
      });

      if (error) {
        console.error('❌ Fallback email also failed:', error);
        return false;
      }

      console.log('✅ Fallback email sent successfully!');
      return true;
    } catch (error) {
      console.error('❌ Fallback email exception:', error);
      return false;
    }
  }

  static async testEmail(email: string) {
    try {
      console.log('🧪 Testing email service with custom domain...');
      
      const { data, error } = await resend.emails.send({
        from: 'LinkStream <noreply@lstream.app>', // Custom domain first
        to: [email],
        subject: '🧪 LinkStream Email Test - Custom Domain',
        html: `
          <h1>🧪 Email Test Successful!</h1>
          <p>This email was sent from your custom domain: lstream.app</p>
          <p>Time: ${new Date().toISOString()}</p>
        `,
      });

      if (error) {
        console.error('❌ Custom domain test failed:', error);
        
        // Try fallback
        const fallbackResult = await resend.emails.send({
          from: 'LinkStream <onboarding@resend.dev>',
          to: [email],
          subject: '🧪 LinkStream Email Test - Fallback',
          html: `
            <h1>🧪 Email Test (Fallback)</h1>
            <p>Custom domain not ready, using fallback domain.</p>
            <p>Time: ${new Date().toISOString()}</p>
          `,
        });
        
        return { 
          success: !fallbackResult.error, 
          data: fallbackResult.data,
          note: 'Used fallback domain - custom domain not ready'
        };
      }

      console.log('✅ Custom domain email test successful!');
      return { success: true, data, note: 'Custom domain working!' };
    } catch (error) {
      console.error('❌ Test email exception:', error);
      return { success: false, error };
    }
  }
}
