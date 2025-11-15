/**
 * Brand Monitoring and Typosquatting Detection
 */

export interface TyposquattingResult {
  domain: string;
  originalDomain: string;
  similarity: number;
  typosquattingType: 'character-substitution' | 'character-omission' | 'character-addition' | 'homoglyph' | 'tld-cybersquatting';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface BrandMonitoringResult {
  brand: string;
  domains: TyposquattingResult[];
  totalThreats: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Detect typosquatting
 */
export function detectTyposquatting(originalDomain: string, candidateDomain: string): TyposquattingResult | null {
  if (originalDomain === candidateDomain) return null;

  // Calculate similarity
  const similarity = calculateSimilarity(originalDomain, candidateDomain);
  
  // Check if similarity is high enough to be suspicious
  if (similarity < 0.7) return null;

  // Determine typosquatting type
  const typosquattingType = detectTyposquattingType(originalDomain, candidateDomain);
  
  // Calculate risk level
  const riskLevel = calculateRiskLevel(similarity, typosquattingType);

  return {
    domain: candidateDomain,
    originalDomain,
    similarity,
    typosquattingType,
    riskLevel,
    description: generateDescription(typosquattingType, originalDomain, candidateDomain),
  };
}

/**
 * Calculate similarity between two domains
 */
function calculateSimilarity(domain1: string, domain2: string): number {
  const longer = domain1.length > domain2.length ? domain1 : domain2;
  const shorter = domain1.length > domain2.length ? domain2 : domain1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(domain1, domain2);
  return (longer.length - distance) / longer.length;
}

/**
 * Levenshtein distance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Detect typosquatting type
 */
function detectTyposquattingType(original: string, candidate: string): TyposquattingResult['typosquattingType'] {
  // Character substitution (e.g., google -> go0gle)
  if (original.length === candidate.length) {
    let substitutions = 0;
    for (let i = 0; i < original.length; i++) {
      if (original[i] !== candidate[i]) substitutions++;
    }
    if (substitutions <= 2) return 'character-substitution';
  }

  // Character omission (e.g., google -> goole)
  if (candidate.length === original.length - 1) {
    return 'character-omission';
  }

  // Character addition (e.g., google -> googles)
  if (candidate.length === original.length + 1) {
    return 'character-addition';
  }

  // Homoglyph (e.g., google -> gооgle with Cyrillic o)
  if (hasHomoglyphs(original, candidate)) {
    return 'homoglyph';
  }

  // TLD cybersquatting (e.g., example.com -> example.net)
  const originalTLD = original.split('.').pop();
  const candidateTLD = candidate.split('.').pop();
  if (originalTLD !== candidateTLD && original.replace(`.${originalTLD}`, '') === candidate.replace(`.${candidateTLD}`, '')) {
    return 'tld-cybersquatting';
  }

  return 'character-substitution';
}

/**
 * Check for homoglyphs
 */
function hasHomoglyphs(str1: string, str2: string): boolean {
  // Common homoglyph mappings
  const homoglyphs: Record<string, string[]> = {
    'a': ['а', 'а'],
    'e': ['е', 'е'],
    'o': ['о', 'о'],
    'p': ['р', 'р'],
    'c': ['с', 'с'],
    'x': ['х', 'х'],
    'y': ['у', 'у'],
  };

  if (str1.length !== str2.length) return false;

  for (let i = 0; i < str1.length; i++) {
    const char1 = str1[i].toLowerCase();
    const char2 = str2[i].toLowerCase();
    
    if (char1 !== char2) {
      const homoglyphSet = homoglyphs[char1] || [];
      if (!homoglyphSet.includes(char2)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Calculate risk level
 */
function calculateRiskLevel(similarity: number, type: TyposquattingResult['typosquattingType']): TyposquattingResult['riskLevel'] {
  if (similarity >= 0.95) return 'critical';
  if (similarity >= 0.85) return 'high';
  if (similarity >= 0.75) return 'medium';
  return 'low';
}

/**
 * Generate description
 */
function generateDescription(type: TyposquattingResult['typosquattingType'], original: string, candidate: string): string {
  switch (type) {
    case 'character-substitution':
      return `Character substitution detected: ${original} -> ${candidate}`;
    case 'character-omission':
      return `Character omission detected: ${original} -> ${candidate}`;
    case 'character-addition':
      return `Character addition detected: ${original} -> ${candidate}`;
    case 'homoglyph':
      return `Homoglyph attack detected: ${original} -> ${candidate}`;
    case 'tld-cybersquatting':
      return `TLD cybersquatting detected: ${original} -> ${candidate}`;
    default:
      return `Typosquatting detected: ${original} -> ${candidate}`;
  }
}

/**
 * Monitor brand
 */
export function monitorBrand(brand: string, candidateDomains: string[]): BrandMonitoringResult {
  const domains: TyposquattingResult[] = [];
  
  for (const candidate of candidateDomains) {
    const result = detectTyposquatting(brand, candidate);
    if (result) {
      domains.push(result);
    }
  }

  // Calculate overall risk
  const criticalThreats = domains.filter(d => d.riskLevel === 'critical').length;
  const highThreats = domains.filter(d => d.riskLevel === 'high').length;
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (criticalThreats > 0) riskLevel = 'critical';
  else if (highThreats > 0) riskLevel = 'high';
  else if (domains.length > 0) riskLevel = 'medium';

  return {
    brand,
    domains,
    totalThreats: domains.length,
    riskLevel,
  };
}

/**
 * Generate common typosquatting variations
 */
export function generateTyposquattingVariations(domain: string): string[] {
  const variations: string[] = [];
  const domainWithoutTLD = domain.split('.').slice(0, -1).join('.');
  const tld = domain.split('.').pop() || 'com';

  // Character substitutions
  const substitutions: Record<string, string[]> = {
    'a': ['4', '@'],
    'e': ['3'],
    'i': ['1', '!'],
    'o': ['0'],
    's': ['5', '$'],
    'l': ['1', '|'],
  };

  for (const [char, replacements] of Object.entries(substitutions)) {
    if (domainWithoutTLD.includes(char)) {
      for (const replacement of replacements) {
        variations.push(domainWithoutTLD.replace(char, replacement) + '.' + tld);
      }
    }
  }

  // Character omissions
  for (let i = 0; i < domainWithoutTLD.length; i++) {
    variations.push(domainWithoutTLD.slice(0, i) + domainWithoutTLD.slice(i + 1) + '.' + tld);
  }

  // Character additions
  for (let i = 0; i < domainWithoutTLD.length; i++) {
    variations.push(domainWithoutTLD.slice(0, i) + domainWithoutTLD[i] + domainWithoutTLD.slice(i) + '.' + tld);
  }

  // TLD variations
  const commonTLDs = ['com', 'net', 'org', 'io', 'co', 'app', 'dev'];
  for (const altTLD of commonTLDs) {
    if (altTLD !== tld) {
      variations.push(domainWithoutTLD + '.' + altTLD);
    }
  }

  return Array.from(new Set(variations));
}

