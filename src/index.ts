import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import * as fs from 'fs-extra';
import * as path from 'path';
import { TestMetrics, TestResultDetail, EnhancedReporterOptions } from './types';
import { EnhancedHTMLGenerator } from './html-generator';

export { TestMetrics, TestResultDetail, EnhancedReporterOptions } from './types';
export { EnhancedHTMLGenerator } from './html-generator';

export default class EnhancedReporter implements Reporter {
  private metrics: TestMetrics;
  private testResults: TestResultDetail[] = [];
  private options: Required<EnhancedReporterOptions>;

  constructor(options: EnhancedReporterOptions = {}) {
    this.options = {
      outputDir: options.outputDir || path.join(process.cwd(), 'test-results', 'reports'),
      outputFile: options.outputFile || 'enhanced-report.html',
      title: options.title || 'Enhanced Test Report',
      includeCharts: options.includeCharts ?? true,
      includeTrends: options.includeTrends ?? true,
      openReport: options.openReport ?? false,
      theme: options.theme || 'auto'
    };

    this.metrics = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      duration: 0,
      passRate: 0,
      failRate: 0,
      avgDuration: 0,
      startTime: new Date(),
      endTime: new Date(),
      browserMetrics: {},
      errorCategories: {},
      severityMetrics: {},
      featureMetrics: {},
      epicMetrics: {}
    };
  }

  onBegin() {
    this.metrics.startTime = new Date();
    console.log('🚀 Starting Enhanced Test Reporter...');
  }

  onTestEnd(test: TestCase, result: TestResult) {
    this.metrics.totalTests++;
    
    const browserName = this.extractBrowserName(test);
    
    if (!this.metrics.browserMetrics[browserName]) {
      this.metrics.browserMetrics[browserName] = { passed: 0, failed: 0, duration: 0 };
    }
    
    const allureProperties = this.extractAllureProperties(test);
    
    if (result.status === 'passed') {
      this.metrics.passed++;
      this.metrics.browserMetrics[browserName].passed++;
      this.updateAllureMetrics(allureProperties, 'passed');
    } else if (result.status === 'failed') {
      this.metrics.failed++;
      this.metrics.browserMetrics[browserName].failed++;
      this.updateAllureMetrics(allureProperties, 'failed');
      
      if (result.error) {
        const errorCategory = this.categorizeError(result.error.message || '');
        this.metrics.errorCategories[errorCategory] = (this.metrics.errorCategories[errorCategory] || 0) + 1;
      }
    } else if (result.status === 'skipped') {
      this.metrics.skipped++;
    } else if (result.status === 'timedOut' || result.status === 'interrupted') {
      this.metrics.failed++;
      this.metrics.browserMetrics[browserName].failed++;
    }
    
    this.metrics.duration += result.duration;
    this.metrics.browserMetrics[browserName].duration += result.duration;
    
    if (!this.metrics.slowestTest || result.duration > this.metrics.slowestTest.duration) {
      this.metrics.slowestTest = { name: test.title, duration: result.duration };
    }
    if (!this.metrics.fastestTest || result.duration < this.metrics.fastestTest.duration) {
      this.metrics.fastestTest = { name: test.title, duration: result.duration };
    }
    
    this.testResults.push({
      test: test.title,
      status: result.status,
      duration: result.duration,
      browser: browserName,
      specFile: this.extractSpecFilePath(test),
      retry: result.retry,
      error: result.error?.message,
      allureProperties
    });
  }

  private extractAllureProperties(test: TestCase): { severity?: string; feature?: string; epic?: string } {
    const properties: { severity?: string; feature?: string; epic?: string } = {};
    
    test.annotations?.forEach(annotation => {
      switch (annotation.type) {
        case 'severity':
          properties.severity = annotation.description || 'normal';
          break;
        case 'feature':
          properties.feature = annotation.description || 'Unknown';
          break;
        case 'epic':
          properties.epic = annotation.description || 'General';
          break;
      }
    });
    
    properties.severity = properties.severity || 'normal';
    properties.feature = properties.feature || 'Unknown';
    properties.epic = properties.epic || 'General';
    
    return properties;
  }

  private updateAllureMetrics(properties: { severity?: string; feature?: string; epic?: string }, status: 'passed' | 'failed') {
    if (properties.severity) {
      if (!this.metrics.severityMetrics[properties.severity]) {
        this.metrics.severityMetrics[properties.severity] = { total: 0, passed: 0, failed: 0 };
      }
      this.metrics.severityMetrics[properties.severity].total++;
      if (status === 'passed') {
        this.metrics.severityMetrics[properties.severity].passed++;
      } else {
        this.metrics.severityMetrics[properties.severity].failed++;
      }
    }
    
    if (properties.feature) {
      if (!this.metrics.featureMetrics[properties.feature]) {
        this.metrics.featureMetrics[properties.feature] = { total: 0, passed: 0, failed: 0 };
      }
      this.metrics.featureMetrics[properties.feature].total++;
      if (status === 'passed') {
        this.metrics.featureMetrics[properties.feature].passed++;
      } else {
        this.metrics.featureMetrics[properties.feature].failed++;
      }
    }
    
    if (properties.epic) {
      if (!this.metrics.epicMetrics[properties.epic]) {
        this.metrics.epicMetrics[properties.epic] = { total: 0, passed: 0, failed: 0 };
      }
      this.metrics.epicMetrics[properties.epic].total++;
      if (status === 'passed') {
        this.metrics.epicMetrics[properties.epic].passed++;
      } else {
        this.metrics.epicMetrics[properties.epic].failed++;
      }
    }
  }

  private extractBrowserName(test: TestCase): string {
    const projectName = test.parent?.project()?.name;
    
    if (projectName) {
      if (projectName === 'chromium' || projectName.includes('chrome')) return 'Chromium';
      if (projectName === 'firefox') return 'Firefox';
      if (projectName === 'webkit' || projectName.includes('safari')) return 'WebKit';
      if (projectName === 'mobile-chrome') return 'Mobile Chrome';
      if (projectName === 'mobile-safari') return 'Mobile Safari';
      return projectName.charAt(0).toUpperCase() + projectName.slice(1);
    }
    
    const testFile = test.location?.file || '';
    const testTitle = test.title || '';
    
    if (testFile.includes('chromium') || testTitle.includes('chromium')) return 'Chromium';
    if (testFile.includes('firefox') || testTitle.includes('firefox')) return 'Firefox';
    if (testFile.includes('webkit') || testTitle.includes('webkit')) return 'WebKit';
    
    return 'Chromium';
  }

  private extractSpecFilePath(test: TestCase): string {
    const filePath = test.location?.file || '';
    
    if (filePath) {
      const projectRoot = process.cwd();
      const relativePath = filePath.replace(projectRoot, '').replace(/\\/g, '/');
      return relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
    }
    
    return 'Unknown';
  }

  async onEnd(result: FullResult) {
    this.metrics.endTime = new Date();
    
    this.metrics.passRate = this.metrics.totalTests > 0 ? (this.metrics.passed / this.metrics.totalTests) * 100 : 0;
    this.metrics.failRate = this.metrics.totalTests > 0 ? (this.metrics.failed / this.metrics.totalTests) * 100 : 0;
    this.metrics.avgDuration = this.metrics.totalTests > 0 ? this.metrics.duration / this.metrics.totalTests : 0;
    
    this.printSummary();
    await this.generateReports();
  }

  private printSummary() {
    console.log('\\n📊 Enhanced Test Execution Summary:');
    console.log(`   Total Tests: ${this.metrics.totalTests}`);
    console.log(`   ✅ Passed: ${this.metrics.passed} (${this.metrics.passRate.toFixed(1)}%)`);
    console.log(`   ❌ Failed: ${this.metrics.failed} (${this.metrics.failRate.toFixed(1)}%)`);
    console.log(`   ⏭️  Skipped: ${this.metrics.skipped}`);
    console.log(`   ⏱️  Total Duration: ${(this.metrics.duration / 1000).toFixed(2)}s`);
    console.log(`   📈 Average Duration: ${this.metrics.avgDuration.toFixed(0)}ms`);

    console.log('\\n📋 Test Coverage by Severity:');
    Object.entries(this.metrics.severityMetrics).forEach(([severity, metrics]) => {
      const passRate = ((metrics.passed / metrics.total) * 100).toFixed(1);
      console.log(`   ${severity.toUpperCase()}: ${metrics.total} tests (${passRate}% pass rate)`);
    });

    console.log('\\n🎯 Test Coverage by Feature:');
    Object.entries(this.metrics.featureMetrics).forEach(([feature, metrics]) => {
      const passRate = ((metrics.passed / metrics.total) * 100).toFixed(1);
      console.log(`   ${feature}: ${metrics.total} tests (${passRate}% pass rate)`);
    });
    
    if (this.metrics.slowestTest) {
      console.log(`   🐌 Slowest Test: ${this.metrics.slowestTest.name} (${this.metrics.slowestTest.duration}ms)`);
    }
    if (this.metrics.fastestTest) {
      console.log(`   🚀 Fastest Test: ${this.metrics.fastestTest.name} (${this.metrics.fastestTest.duration}ms)`);
    }
  }

  private async generateReports() {
    await fs.ensureDir(this.options.outputDir);
    
    await this.generateDetailedReport();
    await this.generateEnhancedHTMLReport();
    
    if (this.options.includeTrends) {
      await this.generateTrendsReport();
    }
    
    console.log('\\n🎯 All enhanced reports generated successfully!');
  }

  private async generateDetailedReport() {
    const reportData = {
      summary: this.metrics,
      testResults: this.testResults,
      generatedAt: new Date().toISOString(),
      options: this.options
    };

    const reportPath = path.join(this.options.outputDir, 'detailed-report.json');
    await fs.writeJSON(reportPath, reportData, { spaces: 2 });
    console.log(`📄 Detailed JSON report saved to: ${reportPath}`);
  }

  private async generateEnhancedHTMLReport() {
    const htmlContent = EnhancedHTMLGenerator.generateHTML(this.metrics, this.testResults, {
      title: this.options.title,
      includeCharts: this.options.includeCharts,
      theme: this.options.theme
    });
    
    const reportPath = path.join(this.options.outputDir, this.options.outputFile);
    await fs.writeFile(reportPath, htmlContent);
    console.log(`📄 Enhanced HTML report saved to: ${reportPath}`);
  }

  private async generateTrendsReport() {
    const trendsPath = path.join(this.options.outputDir, 'trends.json');
    const currentTrend = {
      timestamp: this.metrics.endTime.toISOString(),
      totalTests: this.metrics.totalTests,
      passed: this.metrics.passed,
      failed: this.metrics.failed,
      passRate: this.metrics.passRate,
      duration: this.metrics.duration,
      avgDuration: this.metrics.avgDuration
    };

    const trends = await this.loadExistingTrends(trendsPath);
    trends.push(currentTrend);
    
    if (trends.length > 30) {
      trends.splice(0, trends.length - 30);
    }

    await fs.writeJSON(trendsPath, trends, { spaces: 2 });
    console.log(`📈 Trends report updated: ${trendsPath}`);
  }

  private async loadExistingTrends(trendsPath: string): Promise<any[]> {
    try {
      if (await fs.pathExists(trendsPath)) {
        return await fs.readJSON(trendsPath);
      }
    } catch (error) {
      console.log('No existing trends file found, creating new one');
    }
    return [];
  }

  private categorizeError(errorMessage: string): string {
    if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
      return 'Timeout';
    } else if (errorMessage.includes('selector') || errorMessage.includes('locator')) {
      return 'Selector/Locator';
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'Network';
    } else if (errorMessage.includes('assertion') || errorMessage.includes('expected')) {
      return 'Assertion';
    } else if (errorMessage.includes('navigation') || errorMessage.includes('page')) {
      return 'Navigation';
    } else {
      return 'Other';
    }
  }
}
