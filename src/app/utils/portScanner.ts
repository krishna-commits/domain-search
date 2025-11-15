import fetch from 'node-fetch';
import * as net from 'net';

// Common ports to scan (for quick scans)
const COMMON_PORTS = [
  21, 22, 23, 25, 53, 80, 110, 143, 443, 465, 587, 993, 995, 1433, 3306, 3389, 5432, 8080, 8443, 8888
];

// Port service mapping
const PORT_SERVICES: Record<number, string> = {
  21: 'FTP',
  22: 'SSH',
  23: 'Telnet',
  25: 'SMTP',
  53: 'DNS',
  80: 'HTTP',
  110: 'POP3',
  143: 'IMAP',
  443: 'HTTPS',
  465: 'SMTPS',
  587: 'SMTP (Submission)',
  993: 'IMAPS',
  995: 'POP3S',
  1433: 'MSSQL',
  3306: 'MySQL',
  3389: 'RDP',
  5432: 'PostgreSQL',
  8080: 'HTTP-Proxy',
  8443: 'HTTPS-Alt',
  8888: 'HTTP-Alt',
};

interface PortScanResult {
  port: number;
  open: boolean;
  service?: string;
  banner?: string;
  responseTime?: number;
}

/**
 * Scan a single port using TCP socket connection
 */
async function scanSinglePort(domain: string, port: number, timeout: number = 2000): Promise<PortScanResult> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    let isResolved = false;

    const resolveOnce = (result: PortScanResult) => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(result);
      }
    };

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      const responseTime = Date.now() - start;
      resolveOnce({
        port,
        open: true,
        service: PORT_SERVICES[port] || 'Unknown',
        responseTime,
      });
    });

    socket.on('timeout', () => {
      resolveOnce({
        port,
        open: false,
        service: PORT_SERVICES[port] || 'Unknown',
      });
    });

    socket.on('error', () => {
      resolveOnce({
        port,
        open: false,
        service: PORT_SERVICES[port] || 'Unknown',
      });
    });

    try {
      socket.connect(port, domain);
    } catch (error) {
      resolveOnce({
        port,
        open: false,
        service: PORT_SERVICES[port] || 'Unknown',
      });
    }
  });
}

/**
 * Scan ports with concurrency control
 */
async function scanPortsWithConcurrency(
  domain: string,
  ports: number[],
  concurrency: number = 100,
  timeout: number = 2000
): Promise<PortScanResult[]> {
  const results: PortScanResult[] = [];
  const totalPorts = ports.length;
  let currentIndex = 0;
  const lock = { locked: false };

  const scanBatch = async (): Promise<void> => {
    while (currentIndex < totalPorts) {
      const batch: Promise<PortScanResult>[] = [];
      let batchSize = 0;

      // Get next batch of ports to scan (thread-safe)
      while (lock.locked) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      lock.locked = true;
      const batchStart = currentIndex;
      for (let i = 0; i < concurrency && currentIndex < totalPorts; i++) {
        const port = ports[currentIndex++];
        batch.push(scanSinglePort(domain, port, timeout));
        batchSize++;
      }
      lock.locked = false;

      if (batchSize === 0) break;

      // Wait for batch to complete
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);

      // Log progress for large scans
      if (totalPorts > 1000 && currentIndex % 1000 === 0) {
        console.log(`Port scan progress: ${currentIndex}/${totalPorts} (${Math.round((currentIndex / totalPorts) * 100)}%)`);
      }
    }
  };

  // Run multiple batches in parallel (but with controlled concurrency)
  const numWorkers = Math.min(10, Math.ceil(totalPorts / concurrency));
  const workerPromises: Promise<void>[] = [];
  
  for (let i = 0; i < numWorkers; i++) {
    workerPromises.push(scanBatch());
  }

  await Promise.all(workerPromises);
  return results;
}

/**
 * Scan ports on a domain (0-65535 for full scan, or specified ports)
 */
export async function scanPorts(domain: string, ports?: number[]): Promise<PortScanResult[]> {
  let portsToScan: number[];

  if (ports) {
    portsToScan = ports;
  } else {
    // Generate all ports from 0 to 65535
    portsToScan = Array.from({ length: 65536 }, (_, i) => i);
  }

  // For HTTP/HTTPS ports, try fetch first for better service detection
  const httpPorts = [80, 443];
  const httpResults: PortScanResult[] = [];

  for (const port of httpPorts) {
    if (portsToScan.includes(port)) {
      try {
        const protocol = port === 443 ? 'https' : 'http';
        const start = Date.now();
        const response = await fetch(`${protocol}://${domain}`, {
          method: 'HEAD',
          timeout: 3000,
        } as any);
        
        if (response.ok) {
          const responseTime = Date.now() - start;
          const server = response.headers.get('server');
          httpResults.push({
            port,
            open: true,
            service: PORT_SERVICES[port] || 'HTTP/HTTPS',
            banner: server || undefined,
            responseTime,
          });
        }
      } catch {
        // Will be scanned via TCP socket
      }
    }
  }

  // Remove HTTP ports from the list to scan (already checked)
  const portsToScanTCP = portsToScan.filter(p => !httpPorts.includes(p));

  // Scan remaining ports using TCP sockets
  const tcpResults = await scanPortsWithConcurrency(domain, portsToScanTCP, 100, 2000);

  // Combine results
  const allResults = [...httpResults, ...tcpResults];
  
  // Sort by port number
  return allResults.sort((a, b) => a.port - b.port);
}

/**
 * Get open ports summary
 */
export function getOpenPortsSummary(results: PortScanResult[]) {
  const openPorts = results.filter(r => r.open);
  const closedPorts = results.filter(r => !r.open);
  
  return {
    total: results.length,
    open: openPorts.length,
    closed: closedPorts.length,
    openPorts: openPorts.map(r => ({
      port: r.port,
      service: r.service,
      banner: r.banner,
      responseTime: r.responseTime,
    })),
    riskLevel: openPorts.length > 10 ? 'high' : openPorts.length > 5 ? 'medium' : 'low',
    recommendations: generatePortRecommendations(openPorts),
  };
}

/**
 * Generate recommendations based on open ports
 */
function generatePortRecommendations(openPorts: PortScanResult[]): string[] {
  const recommendations: string[] = [];
  const portNumbers = openPorts.map(p => p.port);

  // Check for risky ports
  if (portNumbers.includes(21)) {
    recommendations.push('FTP (port 21) is open - consider using SFTP instead');
  }
  if (portNumbers.includes(23)) {
    recommendations.push('Telnet (port 23) is open - this is insecure, use SSH instead');
  }
  if (portNumbers.includes(3389)) {
    recommendations.push('RDP (port 3389) is open - ensure strong authentication and consider VPN access');
  }
  if (portNumbers.includes(1433) || portNumbers.includes(3306) || portNumbers.includes(5432)) {
    recommendations.push('Database ports are exposed - restrict access to trusted IPs only');
  }

  if (openPorts.length > 10) {
    recommendations.push('Too many ports are open - review and close unnecessary services');
  }

  return recommendations;
}

