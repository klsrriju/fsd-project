import axios from 'axios';
import { config } from '../config/env';

export interface SMSOptions {
  to: string;
  message: string;
  eventType: 'interview_invitation' | 'status_update' | 'rejection_feedback' | 'future_job_alert';
  channel?: 'sms' | 'whatsapp' | 'both';
  referenceId?: string;
}

export interface SMSRecord {
  id: string;
  to: string;
  message: string;
  channel: 'sms' | 'whatsapp';
  eventType: string;
  referenceId?: string;
  status: 'sent' | 'simulated' | 'failed';
  providerMessageId?: string;
  whatsappUrl?: string;
  sentAt: Date;
  error?: string;
}

// In-memory log of sent SMS/WhatsApp messages (for auditing, duplicate prevention & test verification)
export const smsAuditLog: SMSRecord[] = [];

/**
 * Generate a universal WhatsApp click-to-chat web/mobile URL
 */
export function generateWhatsAppUrl(to: string, message: string): string {
  const cleanPhone = to.replace(/[^0-9]/g, '');
  if (!cleanPhone) return '';
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Deduplication helper: prevents sending duplicate SMS/WhatsApp messages within 5 minutes for the same event and recipient
 */
function isDuplicateSend(to: string, eventType: string, referenceId?: string): boolean {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return smsAuditLog.some(
    (record) =>
      record.to === to &&
      record.eventType === eventType &&
      record.referenceId === referenceId &&
      record.status !== 'failed' &&
      new Date(record.sentAt).getTime() > fiveMinutesAgo
  );
}

/**
 * Send an SMS / WhatsApp notification using Twilio if configured, or record a safe simulated message in development
 */
export async function sendSMS(options: SMSOptions): Promise<{ success: boolean; simulated: boolean; whatsappUrl?: string; messageId?: string; error?: string }> {
  const { to, message, eventType, referenceId, channel = 'sms' } = options;

  if (!to || !to.trim()) {
    return { success: false, simulated: false, error: 'Recipient phone number is missing' };
  }

  const waUrl = generateWhatsAppUrl(to, message);

  // Prevent duplicate sends
  if (referenceId && isDuplicateSend(to, eventType, referenceId)) {
    console.log(`ℹ️ [SMS] Duplicate SMS suppressed for ${to} (${eventType}, ref: ${referenceId})`);
    return { success: true, simulated: true, whatsappUrl: waUrl, error: 'Duplicate send prevented' };
  }

  const { accountSid, authToken, fromNumber } = config.twilio;
  const isConfigured = Boolean(accountSid && authToken && fromNumber);

  // If Twilio credentials are configured, attempt real delivery via official Twilio REST API
  if (isConfigured) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const params = new URLSearchParams();
      params.append('To', to);
      params.append('From', fromNumber);
      params.append('Body', message);

      const response = await axios.post(url, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: authHeader,
        },
        timeout: 8000,
      });

      const sid = response.data?.sid;
      const record: SMSRecord = {
        id: `sms-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        to,
        message,
        channel: channel === 'whatsapp' ? 'whatsapp' : 'sms',
        eventType,
        referenceId,
        status: 'sent',
        providerMessageId: sid,
        whatsappUrl: waUrl,
        sentAt: new Date(),
      };
      smsAuditLog.push(record);
      console.log(`✅ [SMS/WhatsApp] Live notification sent via Twilio to ${to}. Message SID: ${sid}`);
      return { success: true, simulated: false, whatsappUrl: waUrl, messageId: sid };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message;
      console.warn(`⚠️ [SMS] Twilio delivery failed to ${to}: ${errMsg}`);
      const record: SMSRecord = {
        id: `sms-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        to,
        message,
        channel: channel === 'whatsapp' ? 'whatsapp' : 'sms',
        eventType,
        referenceId,
        status: 'failed',
        whatsappUrl: waUrl,
        sentAt: new Date(),
        error: errMsg,
      };
      smsAuditLog.push(record);
      return { success: false, simulated: false, whatsappUrl: waUrl, error: errMsg };
    }
  }

  // Safe development fallback: log simulated SMS/WhatsApp with direct WhatsApp link
  const record: SMSRecord = {
    id: `sms-sim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    to,
    message,
    channel: channel === 'whatsapp' ? 'whatsapp' : 'sms',
    eventType,
    referenceId,
    status: 'simulated',
    whatsappUrl: waUrl,
    sentAt: new Date(),
  };
  smsAuditLog.push(record);

  console.log(`📱 [SMS/WhatsApp Dispatcher] Notification prepared for candidate:`);
  console.log(`   → To:           ${to}`);
  console.log(`   → Channel:      ${channel}`);
  console.log(`   → Event:        ${eventType}`);
  console.log(`   → Message:      "${message}"`);
  console.log(`   → WhatsApp Link: ${waUrl}`);

  return { success: true, simulated: true, whatsappUrl: waUrl, messageId: record.id };
}
