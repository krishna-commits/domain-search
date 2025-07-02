import React from 'react';

interface IPInfoProps {
  ipServices: any[];
}

export default function IPInfo({ ipServices }: IPInfoProps) {
  if (!ipServices || ipServices.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mt-6">
      <h2 className="text-xl font-bold bg-gray-50 px-4 py-3 border-b">IP Addresses & Services</h2>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="space-y-6">
          {ipServices.map((ipService, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                <div className="font-medium text-gray-700">{ipService.ip}</div>
                <span className="text-sm text-gray-500">
                  {ipService.hostnames.length > 0 ? ipService.hostnames.join(', ') : 'No reverse DNS'}
                </span>
              </div>
              
              <div className="px-4 py-3 bg-white">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Services</h4>
                {ipService.services.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {ipService.services.map((service: any, serviceIndex: number) => (
                      <div key={serviceIndex} className="bg-gray-50 p-3 rounded-md">
                        <div className="font-mono text-sm">
                          <span className="text-indigo-600">Port {service.port}</span>
                          <span className="ml-2 text-green-600">{service.service}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No services detected</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}