export interface Packet {
  id: string;
  timestamp: number;
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'DNS';
  sourceIp: string;
  destinationIp: string;
  sourcePort: number;
  destinationPort: number;
  size: number;
  payloadPreview: string;
  isSuspicious: boolean;
  threatType?: 'Port Scan' | 'DDoS Attempt' | 'Malware Signature' | 'DNS Poisoning' | 'ARP Spoofing' | 'Brute Force' | 'None';
  location?: {
    country: string;
    city: string;
    lat: number;
    lon: number;
  };
  reputationScore?: number; // 0-100 (100 = malicious)
  tags?: string[];
}

export interface SystemStats {
  totalPackets: number;
  activeConnections: number;
  bandwidthUsage: number; // Mbps
  threatScore: number;
  securityGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  protocolCounts: Record<string, number>;
}

