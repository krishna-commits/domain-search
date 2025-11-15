/**
 * Core Web Vitals & Performance Analysis
 * - LCP, FID, CLS, FCP, TTI, TBT, Speed Index
 * - Performance Budgets
 * - Resource Optimization
 */

export interface CoreWebVitalsResult {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  tti: number; // Time to Interactive
  tbt: number; // Total Blocking Time
  speedIndex: number;
  performanceScore: number;
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
}

/**
 * Analyze Core Web Vitals
 */
export async function analyzeCoreWebVitals(
  url: string,
  lighthouseData: any
): Promise<CoreWebVitalsResult> {
  const lcp = lighthouseData?.metrics?.largestContentfulPaint?.value || 0;
  const fid = lighthouseData?.metrics?.maxPotentialFid?.value || 0;
  const cls = lighthouseData?.metrics?.cumulativeLayoutShift?.value || 0;
  const fcp = lighthouseData?.metrics?.firstContentfulPaint?.value || 0;
  const tti = lighthouseData?.metrics?.interactive?.value || 0;
  const tbt = lighthouseData?.metrics?.totalBlockingTime?.value || 0;
  const speedIndex = lighthouseData?.metrics?.speedIndex?.value || 0;

  // Calculate performance score
  let performanceScore = 100;
  
  // LCP scoring (good: < 2.5s, needs improvement: 2.5-4s, poor: > 4s)
  if (lcp > 4000) performanceScore -= 25;
  else if (lcp > 2500) performanceScore -= 15;
  
  // FID scoring (good: < 100ms, needs improvement: 100-300ms, poor: > 300ms)
  if (fid > 300) performanceScore -= 25;
  else if (fid > 100) performanceScore -= 15;
  
  // CLS scoring (good: < 0.1, needs improvement: 0.1-0.25, poor: > 0.25)
  if (cls > 0.25) performanceScore -= 25;
  else if (cls > 0.1) performanceScore -= 15;
  
  // FCP scoring (good: < 1.8s, needs improvement: 1.8-3s, poor: > 3s)
  if (fcp > 3000) performanceScore -= 10;
  else if (fcp > 1800) performanceScore -= 5;
  
  // TBT scoring (good: < 200ms, needs improvement: 200-600ms, poor: > 600ms)
  if (tbt > 600) performanceScore -= 10;
  else if (tbt > 200) performanceScore -= 5;

  const performanceGrade = 
    performanceScore >= 90 ? 'A' :
    performanceScore >= 80 ? 'B' :
    performanceScore >= 70 ? 'C' :
    performanceScore >= 60 ? 'D' : 'F';

  const recommendations: string[] = [];
  
  if (lcp > 2500) {
    recommendations.push('Optimize Largest Contentful Paint (LCP) - optimize images, reduce server response time');
  }
  if (fid > 100) {
    recommendations.push('Reduce First Input Delay (FID) - minimize JavaScript execution time');
  }
  if (cls > 0.1) {
    recommendations.push('Reduce Cumulative Layout Shift (CLS) - set size attributes on images and videos');
  }
  if (fcp > 1800) {
    recommendations.push('Optimize First Contentful Paint (FCP) - reduce render-blocking resources');
  }
  if (tbt > 200) {
    recommendations.push('Reduce Total Blocking Time (TBT) - optimize JavaScript execution');
  }
  if (speedIndex > 3400) {
    recommendations.push('Improve Speed Index - optimize resource loading');
  }

  return {
    lcp,
    fid,
    cls,
    fcp,
    tti,
    tbt,
    speedIndex,
    performanceScore: Math.max(0, performanceScore),
    performanceGrade,
    recommendations,
  };
}

/**
 * Set performance budget
 */
export interface PerformanceBudget {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  tti: number;
  tbt: number;
  speedIndex: number;
}

/**
 * Check performance budget
 */
export function checkPerformanceBudget(
  vitals: CoreWebVitalsResult,
  budget: PerformanceBudget
): {
  withinBudget: boolean;
  violations: Array<{
    metric: string;
    actual: number;
    budget: number;
    exceeded: number;
  }>;
} {
  const violations: Array<{
    metric: string;
    actual: number;
    budget: number;
    exceeded: number;
  }> = [];

  if (vitals.lcp > budget.lcp) {
    violations.push({
      metric: 'LCP',
      actual: vitals.lcp,
      budget: budget.lcp,
      exceeded: vitals.lcp - budget.lcp,
    });
  }

  if (vitals.fid > budget.fid) {
    violations.push({
      metric: 'FID',
      actual: vitals.fid,
      budget: budget.fid,
      exceeded: vitals.fid - budget.fid,
    });
  }

  if (vitals.cls > budget.cls) {
    violations.push({
      metric: 'CLS',
      actual: vitals.cls,
      budget: budget.cls,
      exceeded: vitals.cls - budget.cls,
    });
  }

  if (vitals.fcp > budget.fcp) {
    violations.push({
      metric: 'FCP',
      actual: vitals.fcp,
      budget: budget.fcp,
      exceeded: vitals.fcp - budget.fcp,
    });
  }

  if (vitals.tti > budget.tti) {
    violations.push({
      metric: 'TTI',
      actual: vitals.tti,
      budget: budget.tti,
      exceeded: vitals.tti - budget.tti,
    });
  }

  if (vitals.tbt > budget.tbt) {
    violations.push({
      metric: 'TBT',
      actual: vitals.tbt,
      budget: budget.tbt,
      exceeded: vitals.tbt - budget.tbt,
    });
  }

  if (vitals.speedIndex > budget.speedIndex) {
    violations.push({
      metric: 'Speed Index',
      actual: vitals.speedIndex,
      budget: budget.speedIndex,
      exceeded: vitals.speedIndex - budget.speedIndex,
    });
  }

  return {
    withinBudget: violations.length === 0,
    violations,
  };
}

