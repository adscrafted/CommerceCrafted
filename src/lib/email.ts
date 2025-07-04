import nodemailer from 'nodemailer'

export interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    try {
      // For development, use console transport if no email config
      if (!process.env.EMAIL_SERVER_HOST) {
        console.warn('No email configuration found. Using console transport.')
        this.transporter = nodemailer.createTransporter({
          streamTransport: true,
          newline: 'unix',
          buffer: true
        })
        return
      }

      // Production email configuration
      this.transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        secure: process.env.EMAIL_SERVER_PORT === '465',
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })
    } catch (error) {
      console.error('Failed to initialize email transporter:', error)
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized')
      return false
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@commercecrafted.com',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      }

      const result = await this.transporter.sendMail(mailOptions)
      
      // For development with console transport
      if (result.message) {
        console.log('Email content:', result.message.toString())
      }
      
      console.log('Email sent successfully to:', options.to)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  async sendVerificationEmail(email: string, token: string, name?: string): Promise<boolean> {
    const verifyUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email - CommerceCrafted</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Welcome to CommerceCrafted!</h1>
          </div>
          <div class="content">
            <h2>Hi${name ? ` ${name}` : ''}!</h2>
            <p>Thank you for signing up for CommerceCrafted. To complete your registration and start discovering profitable Amazon product opportunities, please verify your email address.</p>
            
            <p style="text-align: center;">
              <a href="${verifyUrl}" class="button">Verify Email Address</a>
            </p>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${verifyUrl}</p>
            
            <p><strong>What's next?</strong></p>
            <ul>
              <li>Access your personalized dashboard</li>
              <li>Discover daily product opportunities</li>
              <li>Use AI-powered product research tools</li>
              <li>Get detailed market analysis and insights</li>
            </ul>
            
            <p>If you didn't create an account with CommerceCrafted, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>This email was sent by CommerceCrafted<br>
            If you have any questions, contact us at support@commercecrafted.com</p>
          </div>
        </body>
      </html>
    `

    const text = `
      Welcome to CommerceCrafted!
      
      Hi${name ? ` ${name}` : ''}!
      
      Thank you for signing up for CommerceCrafted. To complete your registration and start discovering profitable Amazon product opportunities, please verify your email address by clicking the link below:
      
      ${verifyUrl}
      
      What's next?
      - Access your personalized dashboard
      - Discover daily product opportunities
      - Use AI-powered product research tools
      - Get detailed market analysis and insights
      
      If you didn't create an account with CommerceCrafted, you can safely ignore this email.
      
      Best regards,
      The CommerceCrafted Team
    `

    return this.sendEmail({
      to: email,
      subject: 'Verify your email address - CommerceCrafted',
      text,
      html,
    })
  }

  async sendPasswordResetEmail(email: string, token: string, name?: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password - CommerceCrafted</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
            .warning { background: #fef3c7; border: 1px solid #d97706; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi${name ? ` ${name}` : ''}!</h2>
            <p>We received a request to reset your password for your CommerceCrafted account. If you requested this, click the button below to set a new password:</p>
            
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">${resetUrl}</p>
            
            <div class="warning">
              <p><strong>Security Notice:</strong></p>
              <ul style="margin: 0;">
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request this reset, you can safely ignore this email</li>
                <li>Your password will remain unchanged until you create a new one</li>
              </ul>
            </div>
            
            <p>If you're having trouble accessing your account, please contact our support team at support@commercecrafted.com</p>
          </div>
          <div class="footer">
            <p>This email was sent by CommerceCrafted<br>
            For security reasons, this link will expire in 1 hour.</p>
          </div>
        </body>
      </html>
    `

    const text = `
      Password Reset Request - CommerceCrafted
      
      Hi${name ? ` ${name}` : ''}!
      
      We received a request to reset your password for your CommerceCrafted account. If you requested this, click the link below to set a new password:
      
      ${resetUrl}
      
      Security Notice:
      - This link will expire in 1 hour for security reasons
      - If you didn't request this reset, you can safely ignore this email
      - Your password will remain unchanged until you create a new one
      
      If you're having trouble accessing your account, please contact our support team at support@commercecrafted.com
      
      Best regards,
      The CommerceCrafted Team
    `

    return this.sendEmail({
      to: email,
      subject: 'Reset your password - CommerceCrafted',
      text,
      html,
    })
  }

  async sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to CommerceCrafted!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .button { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6b7280; }
            .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #059669; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Welcome to CommerceCrafted!</h1>
          </div>
          <div class="content">
            <h2>Hi${name ? ` ${name}` : ''}!</h2>
            <p>Your email has been verified and your account is now active! You're all set to start discovering profitable Amazon product opportunities.</p>
            
            <div class="feature">
              <h3>🔍 Daily Product Opportunities</h3>
              <p>Get expert-curated product ideas delivered to your dashboard every day.</p>
            </div>
            
            <div class="feature">
              <h3>🤖 AI Research Assistant</h3>
              <p>Ask questions and get intelligent insights about any product or market opportunity.</p>
            </div>
            
            <div class="feature">
              <h3>📊 Deep Market Analysis</h3>
              <p>Access comprehensive analysis including competition, demand, and profitability scores.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" class="button">Access Your Dashboard</a>
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/pricing" class="button">Upgrade to Pro</a>
            </div>
            
            <p><strong>Quick Start Tips:</strong></p>
            <ol>
              <li>Check out today's featured product opportunity</li>
              <li>Browse our product database for inspiration</li>
              <li>Try the AI research assistant with any product idea</li>
              <li>Consider upgrading to Pro for unlimited access</li>
            </ol>
            
            <p>Questions? Our support team is here to help at support@commercecrafted.com</p>
          </div>
          <div class="footer">
            <p>This email was sent by CommerceCrafted<br>
            Start your journey to Amazon success today!</p>
          </div>
        </body>
      </html>
    `

    const text = `
      Welcome to CommerceCrafted!
      
      Hi${name ? ` ${name}` : ''}!
      
      Your email has been verified and your account is now active! You're all set to start discovering profitable Amazon product opportunities.
      
      What you can do now:
      - Daily Product Opportunities: Get expert-curated product ideas delivered to your dashboard every day
      - AI Research Assistant: Ask questions and get intelligent insights about any product or market opportunity
      - Deep Market Analysis: Access comprehensive analysis including competition, demand, and profitability scores
      
      Quick Start Tips:
      1. Check out today's featured product opportunity
      2. Browse our product database for inspiration
      3. Try the AI research assistant with any product idea
      4. Consider upgrading to Pro for unlimited access
      
      Access your dashboard: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard
      
      Questions? Our support team is here to help at support@commercecrafted.com
      
      Best regards,
      The CommerceCrafted Team
    `

    return this.sendEmail({
      to: email,
      subject: '🎉 Welcome to CommerceCrafted - Your account is ready!',
      text,
      html,
    })
  }
}

export const emailService = new EmailService()