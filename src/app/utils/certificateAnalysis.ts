import SSLVerifier from 'ssl-verifier';

/**
 * Deep SSL certificate chain analysis
 */
export async function analyzeCertificateChain(domain: string) {
  try {
    const sslInfo = await SSLVerifier.Info(`https://${domain}`);
    
    const analysis = {
      valid: sslInfo.valid || false,
      chain: sslInfo.chain || [],
      certificate: sslInfo.cert || null,
      issues: [] as string[],
      recommendations: [] as string[],
      grade: calculateCertificateGrade(sslInfo),
    };

    // Analyze certificate chain
    if (analysis.chain.length === 0) {
      analysis.issues.push('No certificate chain found');
    } else {
      // Check chain completeness
      if (analysis.chain.length < 2) {
        analysis.issues.push('Incomplete certificate chain - intermediate certificates may be missing');
        analysis.recommendations.push('Install intermediate certificates to complete the chain');
      }

      // Check certificate expiration
      analysis.chain.forEach((cert: any, index: number) => {
        if (cert.valid_to) {
          const expirationDate = new Date(cert.valid_to);
          const daysUntilExpiry = Math.floor((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiry < 30) {
            analysis.issues.push(`Certificate ${index + 1} expires in ${daysUntilExpiry} days`);
            analysis.recommendations.push(`Renew certificate ${index + 1} before expiration`);
          }
        }
      });
    }

    // Check certificate details
    if (analysis.certificate) {
      const cert = analysis.certificate;
      
      // Check signature algorithm
      if (cert.signatureAlgorithm && cert.signatureAlgorithm.includes('SHA1')) {
        analysis.issues.push('Certificate uses SHA1 signature algorithm (deprecated)');
        analysis.recommendations.push('Use SHA256 or higher for certificate signatures');
      }

      // Check key size
      if (cert.pubkey && cert.pubkey.bits && cert.pubkey.bits < 2048) {
        analysis.issues.push(`Certificate key size is ${cert.pubkey.bits} bits (should be at least 2048)`);
        analysis.recommendations.push('Use RSA 2048-bit or higher, or ECDSA 256-bit or higher');
      }

      // Check certificate transparency
      if (!cert.extensions || !cert.extensions.some((ext: any) => ext.name === 'CT Precertificate SCTs')) {
        analysis.recommendations.push('Enable Certificate Transparency logging');
      }
    }

    return analysis;
  } catch (error: any) {
    return {
      valid: false,
      chain: [],
      certificate: null,
      issues: [`Failed to analyze certificate: ${error.message}`],
      recommendations: ['Check SSL certificate configuration'],
      grade: 'F',
    };
  }
}

/**
 * Calculate certificate grade
 */
function calculateCertificateGrade(sslInfo: any): string {
  let score = 100;

  if (!sslInfo.valid) {
    score -= 50;
  }

  if (sslInfo.chain && sslInfo.chain.length < 2) {
    score -= 20;
  }

  if (sslInfo.cert) {
    const cert = sslInfo.cert;
    
    if (cert.signatureAlgorithm && cert.signatureAlgorithm.includes('SHA1')) {
      score -= 15;
    }

    if (cert.pubkey && cert.pubkey.bits && cert.pubkey.bits < 2048) {
      score -= 15;
    }

    if (cert.valid_to) {
      const expirationDate = new Date(cert.valid_to);
      const daysUntilExpiry = Math.floor((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 30) {
        score -= 10;
      }
    }
  }

  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Check Certificate Transparency logs
 */
export async function checkCertificateTransparency(domain: string) {
  try {
    // Check crt.sh for certificate transparency logs
    const response = await fetch(
      `https://crt.sh/?q=${domain}&output=json`,
      { timeout: 5000 } as any
    );

    if (!response.ok) {
      return {
        found: false,
        certificates: [],
        message: 'Failed to check Certificate Transparency logs',
      };
    }

    const data = await response.json();
    const certificates = Array.isArray(data) ? data : [];

    return {
      found: certificates.length > 0,
      certificates: certificates.slice(0, 10), // Limit to 10 most recent
      total: certificates.length,
      message: `Found ${certificates.length} certificates in CT logs`,
    };
  } catch (error: any) {
    return {
      found: false,
      certificates: [],
      message: `Error checking CT logs: ${error.message}`,
    };
  }
}

