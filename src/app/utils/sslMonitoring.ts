/**
 * SSL Certificate Expiration Monitoring
 */
export interface SSLCertInfo {
  domain: string;
  valid: boolean;
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  daysUntilExpiration: number;
  fingerprint: string;
  serialNumber: string;
}

/**
 * Check SSL certificate expiration
 */
export async function checkSSLExpiration(domain: string): Promise<SSLCertInfo | null> {
  try {
    const https = await import('https');
    const { promisify } = await import('util');
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: domain,
        port: 443,
        method: 'GET',
        rejectUnauthorized: false,
      };

      const req = https.request(options, (res) => {
        const cert = res.socket.getPeerCertificate(true);
        
        if (!cert || !cert.valid_to) {
          resolve(null);
          return;
        }

        const validTo = new Date(cert.valid_to);
        const now = new Date();
        const daysUntilExpiration = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        resolve({
          domain,
          valid: cert.valid_to && new Date(cert.valid_to) > now,
          issuer: cert.issuer?.CN || cert.issuer?.O || 'Unknown',
          subject: cert.subject?.CN || cert.subject?.O || 'Unknown',
          validFrom: new Date(cert.valid_from),
          validTo,
          daysUntilExpiration,
          fingerprint: cert.fingerprint || '',
          serialNumber: cert.serialNumber || '',
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Timeout'));
      });

      req.end();
    });
  } catch (error) {
    console.error('SSL check error:', error);
    return null;
  }
}

/**
 * Get expiration alert level
 */
export function getExpirationAlertLevel(daysUntilExpiration: number): 'none' | 'warning' | 'critical' {
  if (daysUntilExpiration <= 7) return 'critical';
  if (daysUntilExpiration <= 30) return 'warning';
  return 'none';
}

/**
 * Check if certificate needs alert
 */
export function needsExpirationAlert(daysUntilExpiration: number, alertDays: number[] = [30, 15, 7]): boolean {
  return alertDays.some(days => daysUntilExpiration <= days && daysUntilExpiration > days - 1);
}

/**
 * Get expiration status message
 */
export function getExpirationStatusMessage(daysUntilExpiration: number): string {
  if (daysUntilExpiration < 0) {
    return `Certificate expired ${Math.abs(daysUntilExpiration)} days ago`;
  }
  if (daysUntilExpiration === 0) {
    return 'Certificate expires today';
  }
  if (daysUntilExpiration <= 7) {
    return `Certificate expires in ${daysUntilExpiration} days - URGENT`;
  }
  if (daysUntilExpiration <= 30) {
    return `Certificate expires in ${daysUntilExpiration} days - Renew soon`;
  }
  return `Certificate expires in ${daysUntilExpiration} days`;
}

