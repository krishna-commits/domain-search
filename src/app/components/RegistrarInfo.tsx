import React, { useState } from 'react';

interface Contact {
  name?: string;
  organization?: string;
  street?: string | string[];
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  fax?: string;
  email?: string;
}

interface RegistrarInfoProps {
  whois: {
    registrar?: string;
    creationDate?: string | Date;
    updatedDate?: string | Date;
    registryExpiryDate?: string | Date;
    domainStatus?: string | string[];
    registrant?: Contact;
    admin?: Contact;
    technical?: Contact;
  };
}

export default function RegistrarInfo({ whois }: RegistrarInfoProps) {
  // Format dates with error handling
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Unknown';
    }
  };

  // Render domain status with links
  const renderStatus = () => {
    if (!whois.domainStatus) return 'Unknown';
    
    if (Array.isArray(whois.domainStatus)) {
      return whois.domainStatus.map((status, index) => {
        const [statusText, statusUrl] = status.split(/\s+(https?:\/\/\S+)/);
        return (
          <div key={index} className="mb-1 last:mb-0">
            {statusText}
            {statusUrl && (
              <a 
                href={statusUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                (info)
              </a>
            )}
          </div>
        );
      });
    }
    
    const [statusText, statusUrl] = whois.domainStatus.split(/\s+(https?:\/\/\S+)/);
    return (
      <>
        {statusText}
        {statusUrl && (
          <a 
            href={statusUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-1"
          >
            (info)
          </a>
        )}
      </>
    );
  };

  // Render contact information in whois.com format
  const renderContact = (contact: Contact | undefined, title: string) => {
    if (!contact || (!contact.name && !contact.organization)) return null;
    
    // Format address lines
    const formatAddressLines = () => {
      const lines = [];
      
      if (contact?.street) {
        if (Array.isArray(contact.street)) {
          lines.push(...contact.street);
        } else {
          lines.push(contact.street);
        }
      }
      
      if (contact?.city) {
        let cityLine = contact.city;
        if (contact?.state) cityLine += `, ${contact.state}`;
        if (contact?.postalCode) cityLine += `, ${contact.postalCode}`;
        lines.push(cityLine);
      }
      
      if (contact?.country) {
        lines.push(contact.country);
      }
      
      return lines;
    };

    const addressLines = formatAddressLines();

    return (
      <div className="mb-6 border-b pb-4 last:border-0 last:pb-0">
        <h4 className="text-md font-medium text-gray-900 mb-3">{title} Contact</h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <div className="text-gray-600">Name</div>
          <div className="sm:col-span-2 text-gray-900">{contact.name || 'N/A'}</div>
          
          <div className="text-gray-600">Organization</div>
          <div className="sm:col-span-2 text-gray-900">{contact.organization || 'N/A'}</div>
          
          {addressLines.length > 0 && (
            <>
              <div className="text-gray-600">Address</div>
              <div className="sm:col-span-2 text-gray-900">
                {addressLines.map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            </>
          )}
          
          <div className="text-gray-600">Phone</div>
          <div className="sm:col-span-2 text-gray-900">{contact.phone || 'N/A'}</div>
          
          <div className="text-gray-600">Fax</div>
          <div className="sm:col-span-2 text-gray-900">{contact.fax || 'N/A'}</div>
          
          <div className="text-gray-600">Email</div>
          <div className="sm:col-span-2 text-gray-900 break-all">
            {contact.email || 'N/A'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">
        Registrar Information
      </h2>
      
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Domain Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-1">
            <div className="text-sm text-gray-600">Registrar</div>
            <div className="text-sm font-medium text-gray-900 mt-1">
              {whois.registrar || 'Unknown'}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600">Created</div>
            <div className="text-sm font-medium text-gray-900 mt-1">
              {formatDate(whois.creationDate)}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600">Updated</div>
            <div className="text-sm font-medium text-gray-900 mt-1">
              {formatDate(whois.updatedDate)}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600">Expires</div>
            <div className="text-sm font-medium text-gray-900 mt-1">
              {formatDate(whois.registryExpiryDate)}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <div className="text-sm text-gray-600">Status</div>
            <div className="text-sm font-medium text-gray-900 mt-1">
              {renderStatus()}
            </div>
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-4">
          {renderContact(whois.registrant, 'Registrant')}
          {renderContact(whois.admin, 'Admin')}
          {renderContact(whois.technical, 'Tech')}
          
          {!whois.registrant && !whois.admin && !whois.technical && (
            <p className="text-sm text-gray-500 py-4">No contact information available</p>
          )}
        </div>
      </div>
    </div>
  );
}

function RawWhois({ whois }: { whois: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-8">
      <button
        className="text-blue-600 hover:underline text-sm font-medium mb-2"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {open ? 'Hide Raw WHOIS Data' : 'Show Raw WHOIS Data'}
      </button>
      {open && (
        <pre className="bg-gray-100 rounded p-3 text-xs overflow-x-auto border border-gray-200">
          {JSON.stringify(whois, null, 2)}
        </pre>
      )}
    </div>
  );
}

async function checkThreats(domain: string, homepageUrl: string) {
  // 1. URLhaus
  let urlhausData: any = null;
  try {
    const urlhausRes = await fetch(`https://urlhaus-api.abuse.ch/v1/host/${domain}/`);
    urlhausData = urlhausRes.ok ? await urlhausRes.json() : null;
  } catch {}

  // 2. PhishTank (requires API key, see their docs)
  let phishtankData: any = null;
  try {
    const res = await fetch('http://checkurl.phishtank.com/checkurl/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'your-app-name' },
      body: `url=${encodeURIComponent(homepageUrl)}&format=json&app_key=YOUR_PHISHTANK_API_KEY`
    });
    phishtankData = await res.json();
  } catch {}

  // 3. Google Web Risk (requires API key, see docs)
  // Example: https://webrisk.googleapis.com/v1/uris:search?key=YOUR_API_KEY&uri=https://example.com
  let webRiskData: any = null;
  try {
    const webRiskRes = await fetch(`https://webrisk.googleapis.com/v1/uris:search?key=YOUR_WEBRISK_API_KEY&uri=${encodeURIComponent(homepageUrl)}`);
    webRiskData = await webRiskRes.json();
  } catch {}

  // 4. (Optional) APIVoid, OpenPhish, etc.

  return {
    urlhaus: urlhausData,
    phishtank: phishtankData,
    webRisk: webRiskData,
    // ...add more as needed
  };
}