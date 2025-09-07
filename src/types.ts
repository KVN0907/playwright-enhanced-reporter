export interface TestMetrics {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  duration: number;
  passRate: number;
  failRate: number;
  avgDuration: number;
  startTime: Date;
  endTime: Date;
  slowestTest?: { name: string; duration: number };
  fastestTest?: { name: string; duration: number };
  browserMetrics: Record<string, { passed: number; failed: number; duration: number }>;
  errorCategories: Record<string, number>;
  
  // Allure-style metrics
  severityMetrics: Record<string, { total: number; passed: number; failed: number }>;
  featureMetrics: Record<string, { total: number; passed: number; failed: number }>;
  epicMetrics: Record<string, { total: number; passed: number; failed: number }>;
}

export interface TestResultDetail {
  test: string;
  status: string;
  duration: number;
  browser: string;
  specFile: string;
  retry: number;
  error?: string;
  allureProperties?: {
    severity?: string;
    feature?: string;
    epic?: string;
  };
}

export interface EnhancedReporterOptions {
  outputDir?: string;
  outputFile?: string;
  title?: string;
  includeCharts?: boolean;
  includeTrends?: boolean;
  openReport?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}
