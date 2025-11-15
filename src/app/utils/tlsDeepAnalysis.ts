/**
 * SSL/TLS Deep Analysis
 * - TLS Version Support Matrix
 * - Certificate Pinning Analysis
 * - OCSP Stapling Validation
 */

import fetch from 'node-fetch';
import { URL } from 'url';
import tls from 'tls';
import { promisify } from 'util';

export interface TLSVersionSupport {
  tls10: boolean;
  tls11: boolean;
  tls12: boolean;
  tls13: boolean;
  supportedVersions: string[];
  recommendedVersion: string;
  weakVersions: string[];
}

export interface CertificatePinningResult {
  hpkpDetected: boolean;
  hpkpHeader: string | null;
  pinningPresent: boolean;
  mobileAppPinning: boolean;
  recommendations: string[];
}

export interface OCSPStaplingResult {
  ocspStaplingEnabled: boolean;
  ocspResponseTime: number | null;
  ocspResponderAvailable: boolean;
  ocspStatus: 'valid' | 'invalid' | 'unknown';
  recommendations: string[];
}

/**
 * Test TLS version support
 */
export async function testTLSVersions(hostname: string): Promise<TLSVersionSupport> {
  const versions = {
    tls10: false,
    tls11: false,
    tls12: false,
    tls13: false,
  };

  const supportedVersions: string[] = [];
  const weakVersions: string[] = [];

  // Test TLS 1.0
  try {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      secureProtocol: 'TLSv1_method',
      rejectUnauthorized: false,
    });

    await new Promise((resolve, reject) => {
      socket.on('secureConnect', () => {
        versions.tls10 = true;
        supportedVersions.push('TLS 1.0');
        weakVersions.push('TLS 1.0');
        socket.end();
        resolve(true);
      });
      socket.on('error', () => {
        socket.destroy();
        reject(false);
      });
      setTimeout(() => {
        socket.destroy();
        reject(false);
      }, 3000);
    });
  } catch (error) {
    // TLS 1.0 not supported
  }

  // Test TLS 1.1
  try {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      secureProtocol: 'TLSv1_1_method',
      rejectUnauthorized: false,
    });

    await new Promise((resolve, reject) => {
      socket.on('secureConnect', () => {
        versions.tls11 = true;
        supportedVersions.push('TLS 1.1');
        weakVersions.push('TLS 1.1');
        socket.end();
        resolve(true);
      });
      socket.on('error', () => {
        socket.destroy();
        reject(false);
      });
      setTimeout(() => {
        socket.destroy();
        reject(false);
      }, 3000);
    });
  } catch (error) {
    // TLS 1.1 not supported
  }

  // Test TLS 1.2
  try {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      secureProtocol: 'TLSv1_2_method',
      rejectUnauthorized: false,
    });

    await new Promise((resolve, reject) => {
      socket.on('secureConnect', () => {
        versions.tls12 = true;
        supportedVersions.push('TLS 1.2');
        socket.end();
        resolve(true);
      });
      socket.on('error', () => {
        socket.destroy();
        reject(false);
      });
      setTimeout(() => {
        socket.destroy();
        reject(false);
      }, 3000);
    });
  } catch (error) {
    // TLS 1.2 not supported
  }

  // Test TLS 1.3
  try {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      secureProtocol: 'TLSv1_3_method',
      rejectUnauthorized: false,
    });

    await new Promise((resolve, reject) => {
      socket.on('secureConnect', () => {
        versions.tls13 = true;
        supportedVersions.push('TLS 1.3');
        socket.end();
        resolve(true);
      });
      socket.on('error', () => {
        socket.destroy();
        reject(false);
      });
      setTimeout(() => {
        socket.destroy();
        reject(false);
      }, 3000);
    });
  } catch (error) {
    // TLS 1.3 not supported
  }

  let recommendedVersion = 'TLS 1.3';
  if (!versions.tls13) {
    recommendedVersion = 'TLS 1.2';
  }

  return {
    ...versions,
    supportedVersions,
    recommendedVersion,
    weakVersions,
  };
}

/**
 * Check for certificate pinning (HPKP)
 */
export async function checkCertificatePinning(hostname: string, headers: Headers): Promise<CertificatePinningResult> {
  const hpkpHeader = headers.get('Public-Key-Pins') || headers.get('Public-Key-Pins-Report-Only');

  const hpkpDetected = !!hpkpHeader;
  const pinningPresent = hpkpDetected;

  // Check for mobile app pinning (would require app analysis)
  const mobileAppPinning = false; // Placeholder - would need app store analysis

  const recommendations: string[] = [];
  if (!hpkpDetected) {
    recommendations.push('Consider implementing HPKP for additional security');
  } else {
    recommendations.push('HPKP detected - ensure backup pins are configured');
  }

  return {
    hpkpDetected,
    hpkpHeader,
    pinningPresent,
    mobileAppPinning,
    recommendations,
  };
}

/**
 * Validate OCSP stapling
 */
export async function validateOCSPStapling(hostname: string): Promise<OCSPStaplingResult> {
  try {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      rejectUnauthorized: false,
    });

    return new Promise((resolve) => {
      socket.on('secureConnect', () => {
        const cert = socket.getPeerCertificate(true);
        const ocspStaplingEnabled = !!(cert as any).ocspStaple;

        socket.end();

        resolve({
          ocspStaplingEnabled,
          ocspResponseTime: ocspStaplingEnabled ? 0 : null,
          ocspResponderAvailable: true,
          ocspStatus: ocspStaplingEnabled ? 'valid' : 'unknown',
          recommendations: ocspStaplingEnabled
            ? ['OCSP stapling is enabled']
            : ['Enable OCSP stapling for improved performance and security'],
        });
      });

      socket.on('error', () => {
        socket.destroy();
        resolve({
          ocspStaplingEnabled: false,
          ocspResponseTime: null,
          ocspResponderAvailable: false,
          ocspStatus: 'unknown',
          recommendations: ['Unable to check OCSP stapling'],
        });
      });

      setTimeout(() => {
        socket.destroy();
        resolve({
          ocspStaplingEnabled: false,
          ocspResponseTime: null,
          ocspResponderAvailable: false,
          ocspStatus: 'unknown',
          recommendations: ['Timeout checking OCSP stapling'],
        });
      }, 5000);
    });
  } catch (error) {
    return {
      ocspStaplingEnabled: false,
      ocspResponseTime: null,
      ocspResponderAvailable: false,
      ocspStatus: 'unknown',
      recommendations: ['Error checking OCSP stapling'],
    };
  }
}

