import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 12, fontFamily: 'Helvetica', position: 'relative' },
  section: { marginBottom: 16 },
  heading: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#1a237e' },
  label: { fontWeight: 'bold', color: '#0d47a1' },
  value: { marginBottom: 4 },
  list: { marginLeft: 12, marginBottom: 4 },
  item: { marginBottom: 2 },
  table: { flexDirection: 'row', width: 'auto', marginBottom: 8 },
  tableRow: { flexDirection: 'row' },
  tableCell: { flex: 1, padding: 2, border: '1px solid #eee' },
  header: { position: 'absolute', top: 12, left: 24, right: 24, textAlign: 'center', fontSize: 10, color: '#888' },
  footer: { position: 'absolute', bottom: 12, left: 24, right: 24, textAlign: 'center', fontSize: 10, color: '#888' },
});

const CustomHeader = () => (
  <View fixed style={styles.header}>
    <Text>Generated from krishnaneupane.com | Contact: neupane.krishna33@gmail.com</Text>
  </View>
);

const CustomFooter = ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => (
  <View fixed style={styles.footer}>
    <Text>Generated from krishnaneupane.com | Contact: neupane.krishna33@gmail.com | Page {pageNumber} of {totalPages}</Text>
  </View>
);

const renderObject = (obj: any) => {
  if (!obj || typeof obj !== 'object') return <Text style={styles.value}>{String(obj)}</Text>;
  return (
    <View style={styles.list}>
      {Object.entries(obj).map(([k, v]) => (
        <Text key={k} style={styles.value}>
          <Text style={styles.label}>{k}: </Text>
          {typeof v === 'object' && v !== null ? renderObject(v) : String(v)}
        </Text>
      ))}
    </View>
  );
};

const renderArray = (arr: any[]) => (
  <View style={styles.list}>
    {arr.map((item, idx) => (
      <Text key={idx} style={styles.value}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</Text>
    ))}
  </View>
);

export default function ScanReportPDF({ results }: { results: any }) {
  if (!results) return null;
  return (
    <div id="scan-report">
      <Document>
        <Page size="A4" style={styles.page} wrap>
          <CustomHeader />
          {/* Domain Details */}
          <View style={styles.section}>
            <Text style={styles.heading}>Domain Details</Text>
            {results.domainDetails ? renderObject(results.domainDetails) : <Text style={styles.value}>No data</Text>}
          </View>
          {/* SSL/TLS Certificate */}
          <View style={styles.section}>
            <Text style={styles.heading}>SSL/TLS Certificate</Text>
            {results.ssl ? renderObject(results.ssl) : <Text style={styles.value}>No data</Text>}
          </View>
          {/* Emails */}
          <View style={styles.section}>
            <Text style={styles.heading}>Emails</Text>
            {results.emails?.length
              ? renderArray(results.emails)
              : <Text style={styles.value}>No public email addresses found.</Text>
            }
          </View>
          {/* DNS Records */}
          <View style={styles.section}>
            <Text style={styles.heading}>DNS Records</Text>
            {results.dns ? renderObject(results.dns) : <Text style={styles.value}>No data</Text>}
          </View>
          {/* Security Headers */}
          <View style={styles.section}>
            <Text style={styles.heading}>Security Headers</Text>
            {results.security?.headers ? renderObject(results.security.headers) : <Text style={styles.value}>No data</Text>}
          </View>
          {/* Security Protocols */}
          <View style={styles.section}>
            <Text style={styles.heading}>Security Protocols</Text>
            {results.security?.protocols ? renderObject(results.security.protocols) : <Text style={styles.value}>No data</Text>}
          </View>
          {/* Technology Stack */}
          <View style={styles.section}>
            <Text style={styles.heading}>Technology Stack</Text>
            {results.techStack ? renderObject(results.techStack) : <Text style={styles.value}>No data</Text>}
          </View>
          {/* Subdomains */}
          <View style={styles.section}>
            <Text style={styles.heading}>Subdomains</Text>
            {results.subdomains?.length
              ? renderArray(results.subdomains)
              : <Text style={styles.value}>None found.</Text>
            }
          </View>
          {/* Vulnerabilities */}
          <View style={styles.section}>
            <Text style={styles.heading}>Vulnerabilities</Text>
            {results.vulnerabilities?.length
              ? renderArray(results.vulnerabilities)
              : <Text style={styles.value}>None found.</Text>
            }
          </View>
          {/* Broken Links */}
          <View style={styles.section}>
            <Text style={styles.heading}>Broken Links</Text>
            {results.brokenLinks?.length
              ? renderArray(results.brokenLinks)
              : <Text style={styles.value}>None found.</Text>
            }
          </View>
          <CustomFooter pageNumber={1} totalPages={1} />
        </Page>
      </Document>
      <button
        onClick={async () => {
          const element = document.getElementById('scan-report');
          if (element) {
            const canvas = await html2canvas(element);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
              orientation: 'portrait',
              unit: 'pt',
              format: 'a4',
            });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pageWidth;
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('domain-scan-report.pdf');
          }
        }}
      >
        Download PDF Report
      </button>
    </div>
  );
} 