import { Packet } from '../types';

const generateIp = (subnet?: string) => {
  if (subnet) {
     return `${subnet}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

const protocols: Packet['protocol'][] = ['TCP', 'UDP', 'ICMP', 'HTTP', 'DNS'];

const mockedLocations = [
  { country: 'United States', city: 'Virginia', lat: 38.0293, lon: -78.4767 },
  { country: 'United States', city: 'San Jose', lat: 37.3382, lon: -121.8863 },
  { country: 'China', city: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { country: 'Russia', city: 'Moscow', lat: 55.7558, lon: 37.6173 },
  { country: 'Germany', city: 'Frankfurt', lat: 50.1109, lon: 8.6821 },
  { country: 'Brazil', city: 'São Paulo', lat: -23.5505, lon: -46.6333 },
  { country: 'India', city: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { country: 'Singapore', city: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { country: 'North Korea', city: 'Pyongyang', lat: 39.0392, lon: 125.7625 },
  { country: 'Unknown', city: 'Unknown', lat: 0, lon: 0 },
];

export const generateMockPacket = (forceAttackType?: Packet['threatType'], targetIp?: string): Packet => {
  const loc = mockedLocations[Math.floor(Math.random() * mockedLocations.length)];
  
  let isSuspicious = false;
  let threatType: Packet['threatType'] = 'None';
  let reputationScore = Math.floor(Math.random() * 20); // Normal low risk
  let tags: string[] = ['clean'];
  
  if (forceAttackType) {
      isSuspicious = true;
      threatType = forceAttackType;
      reputationScore = Math.floor(Math.random() * 30) + 70; // 70-100
  } else {
      isSuspicious = Math.random() > 0.90; // 10% chance naturally
      if (isSuspicious) {
          const threats: Packet['threatType'][] = ['Port Scan', 'DDoS Attempt', 'Malware Signature', 'Brute Force'];
          threatType = threats[Math.floor(Math.random() * threats.length)];
          reputationScore = Math.floor(Math.random() * 50) + 50;
      }
  }
  
  if (isSuspicious) tags = ['malicious', 'botnet', threatType.replace(' ', '-').toLowerCase()];

  let protocol: Packet['protocol'] = protocols[Math.floor(Math.random() * protocols.length)];
  let size = Math.floor(Math.random() * 1500) + 64;
  let sIp = generateIp();
  let dIp = targetIp || generateIp('192.168');
  let dPort = Math.floor(Math.random() * 65535);

  if (threatType === 'DDoS Attempt') {
      protocol = Math.random() > 0.5 ? 'TCP' : 'UDP'; // SYN Flood or UDP Flood
      size = 64; // Small fast packets for flood
  } else if (threatType === 'Port Scan') {
      protocol = 'TCP';
      size = Math.random() > 0.5 ? 40 : 64; 
  } else if (threatType === 'DNS Poisoning') {
      protocol = 'DNS';
      dPort = 53;
  }

  return {
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
    protocol,
    sourceIp: sIp,
    destinationIp: dIp,
    sourcePort: Math.floor(Math.random() * 65535),
    destinationPort: dPort,
    size,
    payloadPreview: Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(' '),
    isSuspicious,
    threatType,
    location: loc,
    reputationScore,
    tags
  };
};

export const generateAttackBurst = (type: Packet['threatType'], targetIp: string, intensity: number): Packet[] => {
    const burstSize = intensity * 10; // Scale intensity 1-10 to packet burst 10-100
    return Array.from({ length: burstSize }, () => generateMockPacket(type, targetIp));
};
