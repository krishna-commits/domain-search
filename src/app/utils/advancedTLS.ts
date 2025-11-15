/**
 * Advanced TLS/Cipher Analysis
 * - All TLS Versions Testing
 * - Cipher Suite Analysis
 * - TLS Configuration Validation
 */

import tls from 'tls';

export interface AdvancedTLSResult {
  tlsVersions: {
    tls10: { supported: boolean; secure: boolean; issues: string[] };
    tls11: { supported: boolean; secure: boolean; issues: string[] };
    tls12: { supported: boolean; secure: boolean; issues: string[] };
    tls13: { supported: boolean; secure: boolean; issues: string[] };
  };
  cipherSuites: Array<{
    name: string;
    version: string;
    secure: boolean;
    strength: 'weak' | 'medium' | 'strong';
    issues: string[];
  }>;
  configuration: {
    preferredVersion: string;
    preferredCipher: string;
    downgradeProtection: boolean;
    perfectForwardSecrecy: boolean;
    issues: string[];
  };
  recommendations: string[];
}

/**
 * Perform advanced TLS analysis
 */
export async function performAdvancedTLSAnalysis(hostname: string): Promise<AdvancedTLSResult> {
  const tlsVersions = {
    tls10: await testTLSVersion(hostname, 'TLSv1_method'),
    tls11: await testTLSVersion(hostname, 'TLSv1_1_method'),
    tls12: await testTLSVersion(hostname, 'TLSv1_2_method'),
    tls13: await testTLSVersion(hostname, 'TLSv1_3_method'),
  };

  const cipherSuites = await analyzeCipherSuites(hostname);
  
  const configuration = analyzeTLSConfiguration(tlsVersions, cipherSuites);
  
  const recommendations: string[] = [];
  
  if (tlsVersions.tls10.supported || tlsVersions.tls11.supported) {
    recommendations.push('Disable TLS 1.0 and TLS 1.1 - they are deprecated and insecure');
  }
  
  if (!tlsVersions.tls13.supported) {
    recommendations.push('Enable TLS 1.3 for best security and performance');
  }
  
  if (!configuration.perfectForwardSecrecy) {
    recommendations.push('Enable Perfect Forward Secrecy (PFS)');
  }
  
  const weakCiphers = cipherSuites.filter(c => c.strength === 'weak');
  if (weakCiphers.length > 0) {
    recommendations.push(`Remove ${weakCiphers.length} weak cipher suites`);
  }

  return {
    tlsVersions,
    cipherSuites,
    configuration,
    recommendations,
  };
}

/**
 * Test TLS version
 */
async function testTLSVersion(hostname: string, method: string): Promise<{
  supported: boolean;
  secure: boolean;
  issues: string[];
}> {
  const issues: string[] = [];
  let supported = false;
  let secure = false;

  try {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      secureProtocol: method as any,
      rejectUnauthorized: false,
    });

    await new Promise<void>((resolve, reject) => {
      socket.on('secureConnect', () => {
        supported = true;
        const protocol = socket.getProtocol();
        
        if (method === 'TLSv1_method' || method === 'TLSv1_1_method') {
          secure = false;
          issues.push(`${protocol} is deprecated and insecure`);
        } else if (method === 'TLSv1_2_method') {
          secure = true;
        } else if (method === 'TLSv1_3_method') {
          secure = true;
        }
        
        socket.end();
        resolve();
      });
      
      socket.on('error', (error) => {
        supported = false;
        socket.destroy();
        reject(error);
      });
      
      setTimeout(() => {
        socket.destroy();
        reject(new Error('Timeout'));
      }, 3000);
    });
  } catch (error) {
    // Version not supported
  }

  return { supported, secure, issues };
}

/**
 * Analyze cipher suites
 */
async function analyzeCipherSuites(hostname: string): Promise<Array<{
  name: string;
  version: string;
  secure: boolean;
  strength: 'weak' | 'medium' | 'strong';
  issues: string[];
}>> {
  const cipherSuites: Array<{
    name: string;
    version: string;
    secure: boolean;
    strength: 'weak' | 'medium' | 'strong';
    issues: string[];
  }> = [];

  try {
    const socket = tls.connect({
      host: hostname,
      port: 443,
      rejectUnauthorized: false,
    });

    await new Promise<void>((resolve, reject) => {
      socket.on('secureConnect', () => {
        const cipher = socket.getCipher();
        const protocol = socket.getProtocol();
        
        if (cipher) {
          const strength = classifyCipherStrength(cipher.name);
          const secure = strength !== 'weak';
          const issues: string[] = [];
          
          if (!secure) {
            issues.push('Weak cipher suite - should be disabled');
          }
          
          cipherSuites.push({
            name: cipher.name,
            version: protocol || 'unknown',
            secure,
            strength,
            issues,
          });
        }
        
        socket.end();
        resolve();
      });
      
      socket.on('error', (error) => {
        socket.destroy();
        reject(error);
      });
      
      setTimeout(() => {
        socket.destroy();
        reject(new Error('Timeout'));
      }, 3000);
    });
  } catch (error) {
    // Error analyzing cipher suites
  }

  return cipherSuites;
}

/**
 * Classify cipher strength
 */
function classifyCipherStrength(cipherName: string): 'weak' | 'medium' | 'strong' {
  const weakPatterns = [
    /RC4/i,
    /DES/i,
    /MD5/i,
    /SHA1/i,
    /NULL/i,
    /EXPORT/i,
    /ANON/i,
    /ADH/i,
    /AECDH/i,
  ];
  
  const mediumPatterns = [
    /SHA256/i,
    /SHA384/i,
    /AES128/i,
  ];
  
  for (const pattern of weakPatterns) {
    if (pattern.test(cipherName)) {
      return 'weak';
    }
  }
  
  for (const pattern of mediumPatterns) {
    if (pattern.test(cipherName)) {
      return 'medium';
    }
  }
  
  return 'strong';
}

/**
 * Analyze TLS configuration
 */
function analyzeTLSConfiguration(
  tlsVersions: any,
  cipherSuites: Array<{ name: string; secure: boolean; strength: string }>
): {
  preferredVersion: string;
  preferredCipher: string;
  downgradeProtection: boolean;
  perfectForwardSecrecy: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  let preferredVersion = 'TLS 1.2';
  if (tlsVersions.tls13.supported) {
    preferredVersion = 'TLS 1.3';
  } else if (tlsVersions.tls12.supported) {
    preferredVersion = 'TLS 1.2';
  }
  
  const secureCiphers = cipherSuites.filter(c => c.secure);
  const preferredCipher = secureCiphers.length > 0 ? secureCiphers[0].name : 'Unknown';
  
  const downgradeProtection = !tlsVersions.tls10.supported && !tlsVersions.tls11.supported;
  
  const perfectForwardSecrecy = cipherSuites.some(c => 
    /ECDHE|DHE/i.test(c.name)
  );
  
  if (!downgradeProtection) {
    issues.push('TLS downgrade protection not enabled');
  }
  
  if (!perfectForwardSecrecy) {
    issues.push('Perfect Forward Secrecy (PFS) not enabled');
  }

  return {
    preferredVersion,
    preferredCipher,
    downgradeProtection,
    perfectForwardSecrecy,
    issues,
  };
}

