import { TestMetrics, TestResultDetail } from './types';

export interface HTMLGeneratorOptions {
  title?: string;
  includeCharts?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  trendsData?: any[];
}

export class EnhancedHTMLGenerator {
  /**
   * Clean ANSI escape sequences from error messages
   */
  private static sanitizeErrorMessage(errorMessage: string | undefined): string {
    if (!errorMessage) return '-';
    
    // Remove ANSI escape sequences (color codes, formatting)
    return errorMessage
      .replace(/\x1b\[[0-9;]*m/g, '') // Remove ANSI color codes
      .replace(/\[\d+m/g, '')         // Remove bracket color codes
      .replace(/\u001b\[[0-9;]*m/g, '') // Remove unicode escape sequences
      .trim();
  }

  /**
   * Escape HTML characters to prevent XSS
   */
  private static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static generateHTML(
    metrics: TestMetrics, 
    testResults: TestResultDetail[], 
    options: HTMLGeneratorOptions = {}
  ): string {
    const {
      title = 'Enhanced Test Execution Report',
      includeCharts = true,
      theme = 'auto',
      trendsData = []
    } = options;

    const passRate = metrics.passRate.toFixed(1);
    const failRate = metrics.failRate.toFixed(1);
    const avgDuration = metrics.avgDuration.toFixed(0);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    ${includeCharts ? '<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>' : ''}
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        ${this.getCSS()}
    </style>
</head>
<body${theme === 'dark' ? ' class="darkmode"' : ''}>
    <nav class="navbar">
        <div class="navbar-container">
            <a href="#" class="navbar-brand">🎯 ${title}</a>
            <ul class="navbar-nav">
                <li><a href="#overview" class="nav-link">Overview</a></li>
                ${includeCharts ? '<li><a href="#charts" class="nav-link">Charts</a></li>' : ''}
                ${trendsData.length > 0 ? '<li><a href="#trends" class="nav-link">Trends</a></li>' : ''}
                <li><a href="#insights" class="nav-link">Insights</a></li>
                <li><a href="#details" class="nav-link">Details</a></li>
            </ul>
            <button class="darkmode-toggle" onclick="toggleDarkMode()">
                <i class="fas fa-moon" id="darkmode-icon"></i>
            </button>
        </div>
    </nav>

    <div class="main_container">
        ${this.generateOverviewSection(metrics, passRate, failRate, avgDuration)}
        ${this.generateMetricsSection(metrics, passRate, failRate, avgDuration)}
        ${includeCharts ? this.generateChartsSection(metrics) : ''}
        ${trendsData.length > 0 ? this.generateTrendsSection(trendsData) : ''}
        ${metrics.flaky > 0 ? this.generateFlakyTestsSection(testResults) : ''}
        ${this.generateDetailsSection(testResults)}
    </div>

    <script>
        ${this.getJavaScript(metrics, includeCharts, trendsData)}
    </script>
</body>
</html>`;
  }

  private static generateOverviewSection(metrics: TestMetrics, passRate: string, failRate: string, avgDuration: string): string {
    return `
        <!-- Overview Row -->
        <div class="row">
            <div class="col-lg-4">
                <div class="x_panel fixed_height_320">
                    <div class="x_title" onclick="togglePanel(this)">
                        <h2><i class="fas fa-chart-pie"></i> Test Results</h2>
                        <ul class="panel_toolbox">
                            <li><a class="collapse-link"><i class="fas fa-chevron-up"></i></a></li>
                        </ul>
                    </div>
                    <div class="x_content">
                        <div class="chart-container-wrapper">
                            <div class="chart-visual">
                                <canvas id="overview-chart"></canvas>
                                <div class="chart-total">${metrics.totalTests}</div>
                            </div>
                            <div class="chart-legend">
                                <div class="legend-item">
                                    <div class="legend-label">
                                        <i class="fas fa-check-circle passed-color"></i>
                                        <span>Passed</span>
                                    </div>
                                    <span class="legend-percentage">${passRate}%</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-label">
                                        <i class="fas fa-times-circle failed-color"></i>
                                        <span>Failed</span>
                                    </div>
                                    <span class="legend-percentage">${failRate}%</span>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-label">
                                        <i class="fas fa-minus-circle skipped-color"></i>
                                        <span>Skipped</span>
                                    </div>
                                    <span class="legend-percentage">${((metrics.skipped / metrics.totalTests) * 100).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="x_panel fixed_height_320">
                    <div class="x_title" onclick="togglePanel(this)">
                        <h2><i class="fas fa-browser"></i> Browser Performance</h2>
                        <ul class="panel_toolbox">
                            <li><a class="collapse-link"><i class="fas fa-chevron-up"></i></a></li>
                        </ul>
                    </div>
                    <div class="x_content">
                        <div class="chart-container-wrapper">
                            <div class="chart-visual">
                                <canvas id="browser-chart"></canvas>
                                <div class="chart-total">${Object.keys(metrics.browserMetrics).length}</div>
                            </div>
                            <div class="chart-legend">
                                ${Object.entries(metrics.browserMetrics).map(([browser, browserMetrics]: [string, any]) => `
                                    <div class="legend-item">
                                        <div class="legend-label">
                                            <i class="fas fa-globe"></i>
                                            <span>${browser}</span>
                                        </div>
                                        <span class="legend-percentage">${browserMetrics.passed}/${browserMetrics.passed + browserMetrics.failed}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="x_panel fixed_height_320">
                    <div class="x_title" onclick="togglePanel(this)">
                        <h2><i class="fas fa-info-circle"></i> Run Info</h2>
                        <ul class="panel_toolbox">
                            <li><a class="collapse-link"><i class="fas fa-chevron-up"></i></a></li>
                        </ul>
                    </div>
                    <div class="x_content">
                        <table class="info-table">
                            <tr>
                                <td>Execution Date</td>
                                <td>${metrics.startTime.toLocaleDateString()}</td>
                            </tr>
                            <tr>
                                <td>Start Time</td>
                                <td>${metrics.startTime.toLocaleTimeString()}</td>
                            </tr>
                            <tr>
                                <td>End Time</td>
                                <td>${metrics.endTime.toLocaleTimeString()}</td>
                            </tr>
                            <tr>
                                <td>Total Duration</td>
                                <td>${(metrics.duration / 1000).toFixed(2)}s</td>
                            </tr>
                            <tr>
                                <td>Average Duration</td>
                                <td>${avgDuration}ms</td>
                            </tr>
                            <tr>
                                <td>Tests per Second</td>
                                <td>${(metrics.totalTests / ((metrics.duration || 1) / 1000)).toFixed(2)}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>`;
  }

  private static generateMetricsSection(metrics: TestMetrics, passRate: string, failRate: string, avgDuration: string): string {
    return `
        <!-- Metrics Row -->
        <div class="row" id="overview">
            <div class="col-md-12">
                <div class="x_panel">
                    <div class="x_title" onclick="togglePanel(this)">
                        <h2><i class="fas fa-chart-bar"></i> Performance Metrics</h2>
                        <ul class="panel_toolbox">
                            <li><a class="collapse-link"><i class="fas fa-chevron-up"></i></a></li>
                        </ul>
                    </div>
                    <div class="x_content">
                        <div class="metrics-grid">
                            <div class="metric-card passed">
                                <div class="metric-label">Passed Tests</div>
                                <div class="metric-value">${metrics.passed}</div>
                                <div class="metric-subtitle">${passRate}% success rate</div>
                            </div>
                            <div class="metric-card failed">
                                <div class="metric-label">Failed Tests</div>
                                <div class="metric-value">${metrics.failed}</div>
                                <div class="metric-subtitle">${failRate}% failure rate</div>
                            </div>
                            <div class="metric-card flaky">
                                <div class="metric-label">Flaky Tests</div>
                                <div class="metric-value">${metrics.flaky}</div>
                                <div class="metric-subtitle">Passed after retry</div>
                            </div>
                            <div class="metric-card duration">
                                <div class="metric-label">Total Duration</div>
                                <div class="metric-value">${(metrics.duration / 1000).toFixed(1)}s</div>
                                <div class="metric-subtitle">Avg: ${avgDuration}ms per test</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
  }

  private static generateFlakyTestsSection(testResults: TestResultDetail[]): string {
    const flakyTests = testResults.filter(r => r.isFlaky);
    
    return `
        <!-- Flaky Tests Row -->
        <div class="row" id="insights">
            <div class="col-md-12">
                <div class="x_panel">
                    <div class="x_title" onclick="togglePanel(this)">
                        <h2><i class="fas fa-exclamation-triangle"></i> Flaky Tests Warning</h2>
                        <ul class="panel_toolbox">
                            <li><a class="collapse-link"><i class="fas fa-chevron-up"></i></a></li>
                        </ul>
                    </div>
                    <div class="x_content">
                        <div class="flaky-warning">
                            <p><strong>⚠️ ${flakyTests.length} test(s) passed after retry.</strong> These tests may be unstable and require investigation.</p>
                        </div>
                        <div class="table-responsive">
                            <table class="data-table flaky-table">
                                <thead>
                                    <tr>
                                        <th>Test Name</th>
                                        <th>Browser</th>
                                        <th>Retry Count</th>
                                        <th>Duration</th>
                                        <th>Feature</th>
                                        <th>Spec File</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${flakyTests.map(result => `
                                        <tr class="flaky-row">
                                            <td><strong>${result.test}</strong></td>
                                            <td><i class="fas fa-globe"></i> ${result.browser}</td>
                                            <td><span class="retry-badge-large"><i class="fas fa-redo"></i> ${result.retry}</span></td>
                                            <td><i class="fas fa-clock"></i> ${result.duration}ms</td>
                                            <td><i class="fas fa-tag"></i> ${result.allureProperties?.feature || 'Unknown'}</td>
                                            <td><i class="fas fa-file-code"></i> ${result.specFile}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
  }

  private static generateTrendsSection(trendsData: any[]): string {
    return `
        <!-- Trends Row -->
        <div class="row" id="trends">
            <div class="col-md-12">
                <div class="x_panel">
                    <div class="x_title" onclick="togglePanel(this)">
                        <h2><i class="fas fa-chart-line"></i> Historical Trends (Last ${trendsData.length} Runs)</h2>
                        <ul class="panel_toolbox">
                            <li><a class="collapse-link"><i class="fas fa-chevron-up"></i></a></li>
                        </ul>
                    </div>
                    <div class="x_content">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="trend-chart-container">
                                    <h3>Pass Rate Trend</h3>
                                    <canvas id="pass-rate-trend-chart"></canvas>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="trend-chart-container">
                                    <h3>Test Count Trend</h3>
                                    <canvas id="test-count-trend-chart"></canvas>
                                </div>
                            </div>
                        </div>
                        <div class="row" style="margin-top: 30px;">
                            <div class="col-md-6">
                                <div class="trend-chart-container">
                                    <h3>Duration Trend</h3>
                                    <canvas id="duration-trend-chart"></canvas>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="trend-chart-container">
                                    <h3>Pass/Fail Trend</h3>
                                    <canvas id="pass-fail-trend-chart"></canvas>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
  }

  private static generateChartsSection(metrics: TestMetrics): string {
    return `
        <!-- Charts Row -->
        <div class="row" id="charts">
            <div class="col-md-6">
                <div class="x_panel">
                    <div class="x_title" onclick="togglePanel(this)">
                        <h2><i class="fas fa-chart-pie"></i> Error Categories</h2>
                        <ul class="panel_toolbox">
                            <li><a class="collapse-link"><i class="fas fa-chevron-up"></i></a></li>
                        </ul>
                    </div>
                    <div class="x_content">
                        <div style="height: 300px; display: flex; justify-content: center; align-items: center;">
                            <canvas id="error-chart" style="max-height: 250px;"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="x_panel">
                    <div class="x_title" onclick="togglePanel(this)">
                        <h2><i class="fas fa-chart-bar"></i> Severity Distribution</h2>
                        <ul class="panel_toolbox">
                            <li><a class="collapse-link"><i class="fas fa-chevron-up"></i></a></li>
                        </ul>
                    </div>
                    <div class="x_content">
                        <div style="height: 300px; display: flex; justify-content: center; align-items: center;">
                            <canvas id="severity-chart" style="max-height: 250px;"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
  }

  private static generateDetailsSection(testResults: TestResultDetail[]): string {
    return `
        <!-- Test Details Row -->
        <div class="row" id="details">
            <div class="col-md-12">
                <div class="x_panel">
                    <div class="x_title" onclick="togglePanel(this)">
                        <h2><i class="fas fa-list"></i> Test Details</h2>
                        <ul class="panel_toolbox">
                            <li><a class="collapse-link"><i class="fas fa-chevron-up"></i></a></li>
                        </ul>
                    </div>
                    <div class="x_content">
                        <!-- Filters Section -->
                        <div class="filters-container">
                            <div class="filter-group">
                                <label for="search-input"><i class="fas fa-search"></i> Search</label>
                                <input type="text" id="search-input" placeholder="Search test names..." class="filter-input">
                            </div>
                            <div class="filter-group">
                                <label for="status-filter"><i class="fas fa-filter"></i> Status</label>
                                <select id="status-filter" class="filter-select">
                                    <option value="">All</option>
                                    <option value="passed">Passed</option>
                                    <option value="failed">Failed</option>
                                    <option value="skipped">Skipped</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label for="browser-filter"><i class="fas fa-globe"></i> Browser</label>
                                <select id="browser-filter" class="filter-select">
                                    <option value="">All</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label for="severity-filter"><i class="fas fa-exclamation-triangle"></i> Severity</label>
                                <select id="severity-filter" class="filter-select">
                                    <option value="">All</option>
                                    <option value="critical">Critical</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="normal">Normal</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label for="feature-filter"><i class="fas fa-tag"></i> Feature</label>
                                <select id="feature-filter" class="filter-select">
                                    <option value="">All</option>
                                </select>
                            </div>
                            <button id="clear-filters" class="clear-filters-btn"><i class="fas fa-times-circle"></i> Clear Filters</button>
                        </div>
                        <div class="results-summary">
                            Showing <span id="visible-count">0</span> of <span id="total-count">0</span> tests
                            <div class="export-buttons">
                                <button id="export-csv" class="export-btn" title="Export to CSV">
                                    <i class="fas fa-file-csv"></i> CSV
                                </button>
                                <button id="export-json" class="export-btn" title="Export to JSON">
                                    <i class="fas fa-file-code"></i> JSON
                                </button>
                            </div>
                        </div>
                        <div class="pagination-controls">
                            <div class="pagination-info">
                                <label for="page-size">Rows per page:</label>
                                <select id="page-size" class="page-size-select">
                                    <option value="10">10</option>
                                    <option value="25" selected>25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                    <option value="all">All</option>
                                </select>
                            </div>
                            <div class="pagination-buttons">
                                <button id="first-page" class="pagination-btn" title="First Page">
                                    <i class="fas fa-angle-double-left"></i>
                                </button>
                                <button id="prev-page" class="pagination-btn" title="Previous Page">
                                    <i class="fas fa-angle-left"></i>
                                </button>
                                <span class="page-indicator">
                                    Page <span id="current-page">1</span> of <span id="total-pages">1</span>
                                </span>
                                <button id="next-page" class="pagination-btn" title="Next Page">
                                    <i class="fas fa-angle-right"></i>
                                </button>
                                <button id="last-page" class="pagination-btn" title="Last Page">
                                    <i class="fas fa-angle-double-right"></i>
                                </button>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Test Name</th>
                                        <th>Status</th>
                                        <th>Browser</th>
                                        <th>Spec File</th>
                                        <th>Duration</th>
                                        <th>Retry</th>
                                        <th>Severity</th>
                                        <th>Feature</th>
                                        <th>Attachments</th>
                                        <th>Error</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${testResults.map((result, index) => `
                                        <tr>
                                            <td><strong>${result.test}</strong></td>
                                            <td>
                                                <span class="status-badge status-${result.status}">
                                                    <i class="fas fa-${result.status === 'passed' ? 'check' : result.status === 'failed' ? 'times' : 'minus'}"></i>
                                                    ${result.status}
                                                </span>
                                            </td>
                                            <td><i class="fas fa-globe"></i> ${result.browser}</td>
                                            <td><i class="fas fa-file-code"></i> ${result.specFile}</td>
                                            <td><i class="fas fa-clock"></i> ${result.duration}ms</td>
                                            <td>${result.retry > 0 ? `<span class="retry-badge"><i class="fas fa-redo"></i> ${result.retry}</span>` : '-'}</td>
                                            <td><i class="fas fa-exclamation-triangle"></i> ${result.allureProperties?.severity || 'normal'}</td>
                                            <td><i class="fas fa-tag"></i> ${result.allureProperties?.feature || 'Unknown'}</td>
                                            <td>${this.generateAttachmentsHTML(result.attachments, index)}</td>
                                            <td style="max-width: 300px; word-wrap: break-word;">${this.escapeHtml(this.sanitizeErrorMessage(result.error))}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Lightbox Modal -->
        <div id="lightbox" class="lightbox" onclick="closeLightbox()">
            <span class="lightbox-close">&times;</span>
            <img class="lightbox-content" id="lightbox-img">
            <video class="lightbox-content" id="lightbox-video" controls style="display:none;"></video>
            <div class="lightbox-caption" id="lightbox-caption"></div>
            <div class="lightbox-nav">
                <button class="lightbox-prev" onclick="event.stopPropagation(); navigateLightbox(-1)">❮</button>
                <button class="lightbox-next" onclick="event.stopPropagation(); navigateLightbox(1)">❯</button>
            </div>
        </div>`;
  }

  private static generateAttachmentsHTML(attachments: any[] | undefined, testIndex: number): string {
    if (!attachments || attachments.length === 0) {
      return '<span class="no-attachments">-</span>';
    }
    
    const attachmentIcons = attachments.map((attachment, index) => {
      const isImage = attachment.contentType.startsWith('image/');
      const isVideo = attachment.contentType.startsWith('video/');
      const icon = isImage ? 'fa-image' : isVideo ? 'fa-video' : 'fa-file';
      const clickHandler = (isImage || isVideo) 
        ? `onclick="openLightbox('${attachment.path}', '${attachment.name}', ${testIndex}, ${index}, ${isVideo})"` 
        : `onclick="window.open('${attachment.path}', '_blank')"`;
      
      return `<button class="attachment-btn" ${clickHandler} title="${attachment.name}">
        <i class="fas ${icon}"></i>
      </button>`;
    }).join('');
    
    return `<div class="attachments-container">${attachmentIcons}</div>`;
  }

  private static getCSS(): string {
    return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
            /* Material Design Colors */
            --md-primary: #1976d2;
            --md-primary-dark: #1565c0;
            --md-primary-light: #42a5f5;
            --md-secondary: #dc004e;
            --md-success: #4caf50;
            --md-error: #f44336;
            --md-warning: #ff9800;
            --md-info: #2196f3;
            --md-surface: #ffffff;
            --md-background: #fafafa;
            --md-surface-variant: #f5f5f5;
            --md-outline: #e0e0e0;
            --md-outline-variant: #eeeeee;
            --md-shadow: 0 2px 4px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
            --md-shadow-elevation-1: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
            --md-shadow-elevation-2: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
            --md-shadow-elevation-3: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
            --md-shadow-elevation-4: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
        }
        
        body {
            color: rgba(0, 0, 0, 0.87);
            background: var(--md-background);
            font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
            font-size: 14px;
            font-weight: 400;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* Dark Mode Styles */
        body.darkmode {
            --md-primary: #90caf9;
            --md-primary-dark: #42a5f5;
            --md-primary-light: #bbdefb;
            --md-secondary: #f48fb1;
            --md-success: #81c784;
            --md-error: #ef5350;
            --md-warning: #ffb74d;
            --md-info: #64b5f6;
            --md-surface: #121212;
            --md-background: #0a0a0a;
            --md-surface-variant: #1e1e1e;
            --md-outline: #333333;
            --md-outline-variant: #2a2a2a;
            background: var(--md-background) !important;
            color: rgba(255, 255, 255, 0.87);
        }

        body.darkmode .x_panel {
            background: var(--md-surface) !important;
            color: rgba(255, 255, 255, 0.87);
            border: 1px solid var(--md-outline);
            box-shadow: var(--md-shadow-elevation-2);
        }

        body.darkmode .x_title {
            background: var(--md-surface) !important;
            border-bottom: 2px solid var(--md-outline);
            color: rgba(255, 255, 255, 0.87);
        }

        body.darkmode nav.navbar {
            background: var(--md-surface-variant);
            border-bottom: 1px solid var(--md-outline);
            box-shadow: var(--md-shadow-elevation-1);
        }

        /* Navigation */
        nav.navbar {
            background: var(--md-surface);
            border-bottom: 1px solid var(--md-outline-variant);
            margin-bottom: 0;
            padding: 16px 24px;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: var(--md-shadow-elevation-1);
            backdrop-filter: blur(8px);
        }

        .navbar-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
        }

        .navbar-brand {
            font-size: 20px;
            font-weight: 500;
            color: var(--md-primary);
            text-decoration: none;
            transition: color 0.2s ease-in-out;
        }

        .navbar-brand:hover {
            color: var(--md-primary-dark);
        }

        .navbar-nav {
            display: flex;
            gap: 8px;
            list-style: none;
        }

        .nav-link {
            color: rgba(0, 0, 0, 0.6);
            text-decoration: none;
            padding: 12px 16px;
            border-radius: 8px;
            transition: all 0.2s ease-in-out;
            font-weight: 500;
            font-size: 14px;
        }

        .nav-link:hover, .nav-link.active {
            background: var(--md-primary);
            color: white;
            transform: translateY(-1px);
            box-shadow: var(--md-shadow-elevation-2);
        }

        .darkmode-toggle {
            background: none;
            border: 1px solid var(--md-outline);
            font-size: 16px;
            color: rgba(0, 0, 0, 0.6);
            cursor: pointer;
            padding: 10px 12px;
            border-radius: 8px;
            transition: all 0.2s ease-in-out;
            margin-left: 12px;
        }

        .darkmode-toggle:hover {
            background: var(--md-surface-variant);
            border-color: var(--md-primary);
            color: var(--md-primary);
            transform: translateY(-1px);
        }

        body.darkmode .darkmode-toggle {
            color: #b4bfca;
        }

        body.darkmode .darkmode-toggle:hover {
            background: #313a45;
        }

        /* Container */
        /* Main Container */
        .main_container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
            min-height: calc(100vh - 60px);
        }

        .row {
            display: flex;
            flex-wrap: wrap;
            margin: 0 -15px;
            align-items: stretch;
            margin-bottom: 20px;
        }

        .col-md-6, .col-lg-4, .col-md-12 {
            padding: 0 15px;
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
        }

        .col-lg-4 { 
            flex: 0 0 33.333%; 
            max-width: 33.333%; 
        }
        .col-md-6 { 
            flex: 0 0 50%; 
            max-width: 50%; 
        }
        .col-md-12 { 
            flex: 0 0 100%; 
            max-width: 100%; 
        }

        /* Responsive Design Fixes */
        @media (max-width: 1200px) {
            .main_container {
                max-width: 100%;
                padding: 15px;
            }
        }

        @media (max-width: 992px) {
            .col-lg-4 { 
                flex: 0 0 50%; 
                max-width: 50%; 
            }
            .metrics-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
        }

        @media (max-width: 768px) {
            .col-lg-4, .col-md-6 { 
                flex: 0 0 100%; 
                max-width: 100%; 
            }
            .navbar-nav { 
                display: none; 
            }
            .row {
                margin: 0 -10px;
            }
            .col-md-6, .col-lg-4, .col-md-12 {
                padding: 0 10px;
            }
            .metrics-grid {
                grid-template-columns: 1fr;
                gap: 10px;
            }
            .table-responsive {
                font-size: 0.8rem;
            }
            .navbar-container {
                padding: 0 10px;
            }
            .col-md-6, .col-lg-4, .col-md-12 {
                padding: 0 10px;
            }
        }

        /* Panel Styles */
        .x_panel {
            position: relative;
            width: 100%;
            margin-bottom: 16px;
            display: flex;
            flex-direction: column;
            background: var(--md-surface);
            border: 1px solid var(--md-outline-variant);
            border-radius: 12px;
            box-shadow: var(--md-shadow-elevation-2);
            overflow: hidden;
            height: 100%;
            transition: box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out;
        }

        .x_panel:hover {
            box-shadow: var(--md-shadow-elevation-3);
            transform: translateY(-2px);
        }

        .x_title {
            border-bottom: 1px solid var(--md-outline-variant);
            padding: 20px 24px;
            margin-bottom: 0;
            background: var(--md-surface);
            cursor: pointer;
            user-select: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
            font-weight: 500;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.87);
            transition: background-color 0.2s ease-in-out;
        }

        .x_title:hover {
            background: var(--md-surface-variant);
        }

        .x_title h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 500;
            color: #2d3748;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .panel_toolbox {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .collapse-link {
            color: rgba(0, 0, 0, 0.54);
            font-size: 16px;
            text-decoration: none;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.2s ease-in-out;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
        }

        .collapse-link:hover {
            background: var(--md-surface-variant);
            color: var(--md-primary);
            transform: scale(1.1);
        }

        .x_content {
            padding: 25px 20px;
            position: relative;
            width: 100%;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            transition: all 0.3s ease;
            max-height: 2000px;
            overflow: hidden;
        }

        .x_panel.collapsed .x_content {
            max-height: 0;
            padding: 0 20px;
        }

        .fixed_height_320 {
            min-height: 320px;
        }

        .fixed_height_320 .x_content {
            min-height: 220px;
            display: flex;
            align-items: stretch;
            justify-content: center;
            padding: 15px 20px;
        }

        /* Status Colors */
        .passed-color { color: #1ABB9C !important; }
        .failed-color { color: #E74C3C !important; }
        .skipped-color { color: #3498DB !important; }
        .pending-color { color: #FFD119 !important; }

        .passed-background { background: #1ABB9C !important; }
        .failed-background { background: #E74C3C !important; }
        .skipped-background { background: #3498DB !important; }
        .pending-background { background: #FFD119 !important; }

        /* Chart Styles */
        .chart-container-wrapper {
            display: flex;
            align-items: stretch;
            gap: 20px;
            height: auto;
            min-height: 200px;
            padding: 10px;
            justify-content: flex-start;
        }

        .chart-visual {
            position: relative;
            width: 140px;
            height: 140px;
            flex-shrink: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            align-self: center;
        }

        .chart-visual canvas {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 140px !important;
            height: 140px !important;
            z-index: 1;
        }

        .chart-total {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2em;
            font-weight: 700;
            color: #333;
            pointer-events: none;
            z-index: 100;
            text-align: center;
            line-height: 1;
            font-family: 'Roboto', 'Arial', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        body.darkmode .chart-total {
            color: #b4bfca;
        }

        .chart-legend {
            flex: 1;
            min-width: 200px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 4px;
            align-self: center;
        }

        .legend-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 14px;
            border-bottom: 1px solid #efefef;
            min-height: 44px;
            background: #fafafa;
            border-radius: 6px;
            margin-bottom: 0;
        }

        .legend-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }

        body.darkmode .legend-item {
            border-bottom-color: #2e2e2e;
            background: #2a2a2a;
        }

        .legend-label {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.875rem;
            font-weight: 500;
            flex: 1;
        }

        .legend-label i {
            width: 16px;
            text-align: center;
            font-size: 0.95rem;
            flex-shrink: 0;
        }

        .legend-percentage {
            font-weight: 700;
            font-size: 0.875rem;
            white-space: nowrap;
            color: #4a5568;
            min-width: 45px;
            text-align: right;
        }

        body.darkmode .legend-percentage {
            color: #b4bfca;
        }

        /* Metrics Grid */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            align-items: stretch;
            margin: 20px 0;
            padding: 0 10px;
        }

        .metric-card {
            background: white;
            padding: 20px 16px;
            border-radius: 12px;
            border-left: 4px solid #1ABB9C;
            text-align: center;
            box-shadow: var(--md-shadow-elevation-2);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 110px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            position: relative;
            overflow: hidden;
        }

        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--md-shadow-elevation-3);
        }

        .metric-card.failed { border-left-color: var(--md-error); }
        .metric-card.flaky { border-left-color: var(--md-warning); }
        .metric-card.duration { border-left-color: var(--md-info); }

        body.darkmode .metric-card {
            background: #1c1c21;
            border-color: #2e2e2e;
            color: #b4bfca;
        }

        .metric-value {
            font-size: 2.8rem;
            font-weight: bold;
            margin: 12px 0;
            line-height: 1.1;
        }

        .metric-card.passed .metric-value { color: #1ABB9C; }
        .metric-card.failed .metric-value { color: #E74C3C; }
        .metric-card.flaky .metric-value { color: #ff9800; }
        .metric-card.duration .metric-value { color: #3498DB; }

        .metric-label {
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #73879C;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .metric-subtitle {
            font-size: 0.85rem;
            color: #999;
            margin-top: 8px;
            opacity: 0.9;
        }

        body.darkmode .metric-subtitle {
            color: #999;
        }

        /* Run Info Styles */
        .info-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 3px;
            margin: 0;
        }

        .info-table tr {
            background: #fafafa;
        }

        .info-table td {
            padding: 10px 14px;
            font-size: 0.875rem;
            vertical-align: middle;
            line-height: 1.4;
        }

        .info-table td:first-child {
            font-weight: 500;
            width: 55%;
            color: #4a5568;
            border-radius: 6px 0 0 6px;
        }

        .info-table td:last-child {
            color: #2d3748;
            text-align: right;
            font-weight: 600;
            width: 45%;
            border-radius: 0 6px 6px 0;
        }

        body.darkmode .info-table tr {
            background: #2a2a2a;
        }

        body.darkmode .info-table td:first-child {
            color: #a3c2db;
        }

        body.darkmode .info-table td:last-child {
            color: #b4bfca;
        }

        /* Tables */
        .table-responsive {
            overflow-x: auto;
            max-height: 600px;
            overflow-y: auto;
            border-radius: 8px;
            border: 1px solid #E6E9ED;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            margin: 0;
            min-width: 1000px; /* Increased for better column distribution */
            table-layout: fixed; /* Fixed layout for consistent column widths */
        }

        .data-table th {
            background: #F5F7FA;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
            color: #4a5568;
            border-bottom: 2px solid #E6E9ED;
            position: sticky;
            top: 0;
            font-size: 0.9rem;
            white-space: nowrap;
            z-index: 10;
            vertical-align: middle;
        }

        /* Define specific column widths */
        .data-table th:nth-child(1) { width: 16%; } /* Test Name */
        .data-table th:nth-child(2) { width: 8%; }  /* Status */
        .data-table th:nth-child(3) { width: 9%; } /* Browser */
        .data-table th:nth-child(4) { width: 12%; } /* Spec File */
        .data-table th:nth-child(5) { width: 7%; }  /* Duration */
        .data-table th:nth-child(6) { width: 6%; }  /* Retry */
        .data-table th:nth-child(7) { width: 8%; }  /* Severity */
        .data-table th:nth-child(8) { width: 10%; } /* Feature */
        .data-table th:nth-child(9) { width: 10%; } /* Attachments */
        .data-table th:nth-child(10) { width: 14%; } /* Error */

        .data-table td {
            padding: 12px 10px;
            border-bottom: 1px solid #E6E9ED;
            font-size: 0.85rem;
            vertical-align: middle;
            line-height: 1.4;
            overflow: hidden;
        }

        /* Test name column styling */
        .data-table td:nth-child(1) {
            font-weight: 600;
            word-wrap: break-word;
            word-break: break-word;
            white-space: normal;
        }

        /* Status column styling */
        .data-table td:nth-child(2) {
            text-align: center;
            padding: 12px 8px;
        }

        /* Browser, Duration, Severity, Feature columns */
        .data-table td:nth-child(3),
        .data-table td:nth-child(5),
        .data-table td:nth-child(6),
        .data-table td:nth-child(7) {
            text-align: center;
        }

        /* Icon alignment in table cells */
        .data-table td i {
            margin-right: 6px;
            width: 14px;
            text-align: center;
            display: inline-block;
        }

        /* Error message column styling */
        .data-table td:nth-child(10) {
            word-wrap: break-word;
            word-break: break-word;
            white-space: normal;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.75rem;
            background: rgba(231, 76, 60, 0.05);
            color: #e74c3c;
            border-left: 2px solid #e74c3c;
            padding-left: 12px;
            vertical-align: top;
        }

        body.darkmode .data-table td:nth-child(10) {
            background: rgba(231, 76, 60, 0.1);
            color: #ff6b6b;
            border-left-color: #ff6b6b;
        }

        /* Spec file column styling */
        .data-table td:nth-child(4) {
            font-family: 'Courier New', monospace;
            font-size: 0.8rem;
            color: #5A738E;
            max-width: 200px;
            word-wrap: break-word;
            word-break: break-all;
            text-align: left;
        }

        body.darkmode .data-table td:nth-child(4) {
            color: #a3c2db;
        }

        .data-table tr:hover {
            background: #f8f9fa;
        }

        .data-table tr:nth-child(even) {
            background: #fafbfc;
        }

        body.darkmode .data-table {
            background: #1c1c21;
            color: #b4bfca;
        }

        body.darkmode .data-table th {
            background: #212121;
            color: #a3c2db;
            border-color: #2e2e2e;
        }

        body.darkmode .data-table td {
            border-color: #2e2e2e;
        }

        body.darkmode .data-table tr:nth-child(even) {
            background: #212121;
        }

        body.darkmode .data-table tr:hover {
            background: #2a2a2f;
        }

        body.darkmode .table-responsive {
            border-color: #2e2e2e;
        }

        /* Status Badges */
        .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 600;
            text-transform: uppercase;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 3px;
            min-width: 70px;
            white-space: nowrap;
        }

        .status-passed {
            background: rgba(76, 175, 80, 0.12);
            color: var(--md-success);
            border: 1px solid rgba(76, 175, 80, 0.3);
        }

        .status-failed {
            background: rgba(244, 67, 54, 0.12);
            color: var(--md-error);
            border: 1px solid rgba(244, 67, 54, 0.3);
        }

        .status-skipped {
            background: rgba(33, 150, 243, 0.12);
            color: var(--md-info);
            border: 1px solid rgba(33, 150, 243, 0.3);
        }

        /* Retry Badge */
        .retry-badge {
            background: rgba(255, 193, 7, 0.1);
            color: #ff9800;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.85em;
            border: 1px solid rgba(255, 193, 7, 0.3);
        }

        .retry-badge-large {
            background: rgba(255, 193, 7, 0.15);
            color: #ff9800;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.9em;
            border: 1px solid rgba(255, 193, 7, 0.4);
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        /* Filters Section */
        .filters-container {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 20px;
            padding: 20px;
            background: var(--md-surface-variant);
            border-radius: 12px;
            border: 1px solid var(--md-outline-variant);
            align-items: flex-end;
        }

        .filter-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-width: 180px;
            flex: 1;
        }

        .filter-group label {
            font-size: 0.85rem;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .filter-input,
        .filter-select {
            padding: 10px 14px;
            border: 1px solid var(--md-outline);
            border-radius: 8px;
            font-size: 0.95rem;
            background: var(--md-surface);
            color: rgba(0, 0, 0, 0.87);
            transition: all 0.2s ease;
        }

        .filter-input:focus,
        .filter-select:focus {
            outline: none;
            border-color: var(--md-primary);
            box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
        }

        .clear-filters-btn {
            padding: 10px 20px;
            background: var(--md-error);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
        }

        .clear-filters-btn:hover {
            background: #d32f2f;
            transform: translateY(-1px);
            box-shadow: var(--md-shadow-elevation-2);
        }

        .results-summary {
            margin-bottom: 15px;
            padding: 12px 16px;
            background: var(--md-primary);
            color: white;
            border-radius: 8px;
            font-weight: 500;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        }

        .results-summary span {
            font-weight: 700;
            font-size: 1.1em;
        }

        .export-buttons {
            display: flex;
            gap: 8px;
        }

        .export-btn {
            padding: 6px 14px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
            font-weight: 500;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .export-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-1px);
        }

        .export-btn i {
            font-size: 1rem;
        }

        /* Pagination Controls */
        .pagination-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding: 15px 20px;
            background: var(--md-surface-variant);
            border-radius: 8px;
            border: 1px solid var(--md-outline-variant);
            flex-wrap: wrap;
            gap: 15px;
        }

        .pagination-info {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .pagination-info label {
            font-size: 0.9rem;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.7);
        }

        .page-size-select {
            padding: 8px 12px;
            border: 1px solid var(--md-outline);
            border-radius: 6px;
            background: var(--md-surface);
            color: rgba(0, 0, 0, 0.87);
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .page-size-select:focus {
            outline: none;
            border-color: var(--md-primary);
            box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
        }

        .pagination-buttons {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .pagination-btn {
            padding: 8px 12px;
            background: var(--md-surface);
            border: 1px solid var(--md-outline);
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            color: rgba(0, 0, 0, 0.7);
            font-size: 1rem;
        }

        .pagination-btn:hover:not(:disabled) {
            background: var(--md-primary);
            color: white;
            border-color: var(--md-primary);
            transform: translateY(-1px);
            box-shadow: var(--md-shadow-elevation-1);
        }

        .pagination-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .page-indicator {
            padding: 0 10px;
            font-size: 0.9rem;
            font-weight: 500;
            color: rgba(0, 0, 0, 0.7);
            white-space: nowrap;
        }

        .page-indicator span {
            font-weight: 700;
            color: var(--md-primary);
        }

        body.darkmode .pagination-controls {
            background: var(--md-surface);
            border-color: var(--md-outline);
        }

        body.darkmode .pagination-info label,
        body.darkmode .page-indicator {
            color: rgba(255, 255, 255, 0.7);
        }

        body.darkmode .page-size-select,
        body.darkmode .pagination-btn {
            background: var(--md-surface-variant);
            color: rgba(255, 255, 255, 0.87);
            border-color: var(--md-outline);
        }

        body.darkmode .page-indicator span {
            color: var(--md-primary-light);
        }

        body.darkmode .filters-container {
            background: var(--md-surface);
            border-color: var(--md-outline);
        }

        body.darkmode .filter-group label {
            color: rgba(255, 255, 255, 0.7);
        }

        body.darkmode .filter-input,
        body.darkmode .filter-select {
            background: var(--md-surface-variant);
            color: rgba(255, 255, 255, 0.87);
            border-color: var(--md-outline);
        }

        /* Trends Section */
        .trend-chart-container {
            background: var(--md-surface);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid var(--md-outline-variant);
            box-shadow: var(--md-shadow-elevation-1);
            height: 100%;
        }

        .trend-chart-container h3 {
            margin: 0 0 20px 0;
            font-size: 1.1rem;
            font-weight: 500;
            color: var(--md-primary);
            text-align: center;
        }

        .trend-chart-container canvas {
            width: 100% !important;
            height: 250px !important;
        }

        body.darkmode .trend-chart-container {
            background: var(--md-surface-variant);
            border-color: var(--md-outline);
        }

        body.darkmode .trend-chart-container h3 {
            color: var(--md-primary-light);
        }

        /* Flaky Tests Section */
        .flaky-warning {
            background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.05));
            border-left: 4px solid #ff9800;
            padding: 16px 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            font-size: 1rem;
        }

        .flaky-warning strong {
            color: #ff9800;
        }

        .flaky-table {
            border: 2px solid rgba(255, 193, 7, 0.3);
        }

        .flaky-row {
            background: rgba(255, 193, 7, 0.03);
        }

        .flaky-row:hover {
            background: rgba(255, 193, 7, 0.08) !important;
        }

        body.darkmode .flaky-warning {
            background: linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 152, 0, 0.08));
            border-left-color: #ffb74d;
        }

        body.darkmode .flaky-warning strong {
            color: #ffb74d;
        }

        /* Attachments */
        .attachments-container {
            display: flex;
            gap: 6px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .attachment-btn {
            background: var(--md-primary);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
        }

        .attachment-btn:hover {
            background: var(--md-primary-dark);
            transform: translateY(-2px);
            box-shadow: var(--md-shadow-elevation-2);
        }

        .no-attachments {
            color: #999;
            font-style: italic;
        }

        /* Lightbox */
        .lightbox {
            display: none;
            position: fixed;
            z-index: 10000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.95);
            overflow: auto;
            animation: lightboxFadeIn 0.3s;
        }

        .lightbox.active {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        @keyframes lightboxFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .lightbox-content {
            max-width: 90%;
            max-height: 90%;
            margin: auto;
            display: block;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }

        .lightbox-close {
            position: absolute;
            top: 30px;
            right: 45px;
            color: #fff;
            font-size: 40px;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
            z-index: 10001;
        }

        .lightbox-close:hover,
        .lightbox-close:focus {
            color: #ff4444;
        }

        .lightbox-caption {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            color: #fff;
            text-align: center;
            padding: 12px 24px;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 8px;
            font-size: 16px;
            max-width: 80%;
        }

        .lightbox-nav {
            position: absolute;
            top: 50%;
            width: 100%;
            display: flex;
            justify-content: space-between;
            padding: 0 20px;
            transform: translateY(-50%);
            pointer-events: none;
        }

        .lightbox-prev,
        .lightbox-next {
            pointer-events: all;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            padding: 16px 20px;
            cursor: pointer;
            font-size: 24px;
            border-radius: 8px;
            transition: all 0.3s;
        }

        .lightbox-prev:hover,
        .lightbox-next:hover {
            background: rgba(255, 255, 255, 0.4);
            transform: scale(1.1);
        }

        /* Smooth Scrolling */
        html { scroll-behavior: smooth; }

        /* Loading Animation */
        .loading { opacity: 0; animation: fadeIn 0.5s ease-in forwards; }
        @keyframes fadeIn { to { opacity: 1; } }

        /* Responsive Design */
        @media (max-width: 768px) {
            .main_container { 
                padding: 15px; 
            }
            .chart-container-wrapper { 
                flex-direction: column; 
                height: auto; 
                align-items: center;
                gap: 25px;
                padding: 25px 10px;
            }
            
            .chart-legend {
                min-width: 100%;
                order: 2;
            }
            
            .chart-visual {
                order: 1;
                margin-top: 0;
            }
            
            .legend-item {
                padding: 12px 14px;
                margin-bottom: 6px;
            }
            }
            .chart-visual { 
                margin-right: 0; 
                margin-bottom: 0;
                width: 140px;
                height: 140px;
            }
            .chart-legend {
                width: 100%;
                max-width: 320px;
                gap: 3px;
            }
            .legend-item {
                padding: 10px 0;
                min-height: 38px;
            }
            .metrics-grid {
                grid-template-columns: 1fr;
                gap: 15px;
            }
            .navbar-container {
                padding: 0 15px;
            }
            .data-table th,
            .data-table td {
                padding: 10px 6px;
                font-size: 0.8rem;
            }
            
            /* Mobile table adjustments */
            .data-table {
                min-width: 900px;
            }
            
            .data-table th:nth-child(1) { width: 30%; } /* Test Name - larger on mobile */
            .data-table th:nth-child(2) { width: 10%; } /* Status */
            .data-table th:nth-child(3) { width: 8%; }  /* Browser */
            .data-table th:nth-child(4) { width: 12%; } /* Spec File */
            .data-table th:nth-child(5) { width: 8%; }  /* Duration */
            .data-table th:nth-child(6) { width: 8%; }  /* Severity */
            .data-table th:nth-child(7) { width: 10%; } /* Feature */
            .data-table th:nth-child(8) { width: 14%; } /* Error */
            
            .status-badge {
                padding: 3px 6px;
                font-size: 0.65rem;
                min-width: 60px;
            }
            
            .data-table td i {
                margin-right: 4px;
                width: 12px;
            }
            .metric-value {
                font-size: 2.2rem;
            }
            .info-table td {
                padding: 12px 8px;
                font-size: 0.9rem;
            }
            .info-table td:first-child {
                width: 55%;
            }
            .x_content {
                padding: 20px 15px;
            }
            .fixed_height_320 .x_content {
                min-height: 200px;
            }
        }

        @media (max-width: 480px) {
            .navbar-brand {
                font-size: 16px;
            }
            .chart-visual {
                width: 120px;
                height: 120px;
            }
            .chart-total {
                font-size: 1.6em;
                line-height: 1;
            }
            .x_title h2 {
                font-size: 16px;
            }
            .metric-card {
                padding: 25px 20px;
                min-height: 120px;
            }
            .metric-value {
                font-size: 2rem;
            }
            .legend-label {
                font-size: 0.9rem;
            }
            .legend-percentage {
                font-size: 0.9rem;
            }
            .x_content {
                padding: 15px;
            }
        }
    `;
  }

  private static getJavaScript(metrics: TestMetrics, includeCharts: boolean, trendsData: any[]): string {
    return `
        // Dark Mode Toggle
        function toggleDarkMode() {
            document.body.classList.toggle('darkmode');
            const icon = document.getElementById('darkmode-icon');
            if (document.body.classList.contains('darkmode')) {
                icon.className = 'fas fa-sun';
                localStorage.setItem('darkMode', 'enabled');
            } else {
                icon.className = 'fas fa-moon';
                localStorage.setItem('darkMode', 'disabled');
            }
        }

        // Load saved dark mode preference
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.body.classList.add('darkmode');
            document.getElementById('darkmode-icon').className = 'fas fa-sun';
        }

        // Panel Toggle Function
        function togglePanel(titleElement) {
            const panel = titleElement.closest('.x_panel');
            const content = panel.querySelector('.x_content');
            const icon = titleElement.querySelector('.collapse-link i');
            
            panel.classList.toggle('collapsed');
            
            if (panel.classList.contains('collapsed')) {
                icon.className = 'fas fa-chevron-down';
            } else {
                icon.className = 'fas fa-chevron-up';
            }
        }

        // Smooth Scrolling for Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Lightbox functionality
        let currentLightboxData = [];
        let currentLightboxIndex = 0;

        function openLightbox(path, name, testIndex, attachmentIndex, isVideo) {
            const lightbox = document.getElementById('lightbox');
            const img = document.getElementById('lightbox-img');
            const video = document.getElementById('lightbox-video');
            const caption = document.getElementById('lightbox-caption');
            
            if (isVideo) {
                img.style.display = 'none';
                video.style.display = 'block';
                video.src = path;
            } else {
                video.style.display = 'none';
                img.style.display = 'block';
                img.src = path;
            }
            
            caption.innerHTML = name;
            lightbox.classList.add('active');
            
            // Store current data for navigation
            currentLightboxIndex = attachmentIndex;
            // You can enhance this to collect all attachments from the test
        }

        function closeLightbox() {
            const lightbox = document.getElementById('lightbox');
            const video = document.getElementById('lightbox-video');
            lightbox.classList.remove('active');
            video.pause();
            video.src = '';
        }

        function navigateLightbox(direction) {
            // Placeholder for navigation between attachments
            // Can be enhanced to navigate through all attachments
            console.log('Navigate:', direction);
        }

        // Close lightbox on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });

        // Filtering and Pagination functionality
        function initializeFilters() {
            const table = document.querySelector('.data-table tbody');
            if (!table) return;
            
            const rows = Array.from(table.querySelectorAll('tr'));
            const totalCount = rows.length;
            
            // Pagination state
            let currentPage = 1;
            let pageSize = 25;
            let filteredRows = [...rows];
            
            // Populate dynamic filters
            const browsers = new Set();
            const features = new Set();
            
            rows.forEach(row => {
                const browserCell = row.cells[2]?.textContent.trim().replace(/^.*\\s/, '');
                const featureCell = row.cells[7]?.textContent.trim().replace(/^.*\\s/, '');
                if (browserCell) browsers.add(browserCell);
                if (featureCell) features.add(featureCell);
            });
            
            const browserFilter = document.getElementById('browser-filter');
            const featureFilter = document.getElementById('feature-filter');
            
            browsers.forEach(browser => {
                const option = document.createElement('option');
                option.value = browser;
                option.textContent = browser;
                browserFilter.appendChild(option);
            });
            
            features.forEach(feature => {
                const option = document.createElement('option');
                option.value = feature;
                option.textContent = feature;
                featureFilter.appendChild(option);
            });
            
            // Update count
            document.getElementById('total-count').textContent = totalCount;
            document.getElementById('visible-count').textContent = totalCount;
            
            // Filter and pagination function
            function applyFilters() {
                const searchValue = document.getElementById('search-input').value.toLowerCase();
                const statusValue = document.getElementById('status-filter').value.toLowerCase();
                const browserValue = document.getElementById('browser-filter').value;
                const severityValue = document.getElementById('severity-filter').value.toLowerCase();
                const featureValue = document.getElementById('feature-filter').value;
                
                // First, filter rows
                filteredRows = rows.filter(row => {
                    const testName = row.cells[0]?.textContent.toLowerCase() || '';
                    const status = row.cells[1]?.textContent.toLowerCase() || '';
                    const browser = row.cells[2]?.textContent || '';
                    const severity = row.cells[6]?.textContent.toLowerCase() || '';
                    const feature = row.cells[7]?.textContent || '';
                    
                    const matchesSearch = testName.includes(searchValue);
                    const matchesStatus = !statusValue || status.includes(statusValue);
                    const matchesBrowser = !browserValue || browser.includes(browserValue);
                    const matchesSeverity = !severityValue || severity.includes(severityValue);
                    const matchesFeature = !featureValue || feature.includes(featureValue);
                    
                    return matchesSearch && matchesStatus && matchesBrowser && matchesSeverity && matchesFeature;
                });
                
                // Reset to first page when filters change
                currentPage = 1;
                
                // Update count
                document.getElementById('visible-count').textContent = filteredRows.length;
                
                // Apply pagination
                applyPagination();
            }
            
            function applyPagination() {
                const pageSizeValue = document.getElementById('page-size').value;
                pageSize = pageSizeValue === 'all' ? filteredRows.length : parseInt(pageSizeValue);
                
                const totalPages = Math.ceil(filteredRows.length / pageSize);
                const startIndex = (currentPage - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                
                // Hide all rows first
                rows.forEach(row => row.style.display = 'none');
                
                // Show only rows for current page
                filteredRows.slice(startIndex, endIndex).forEach(row => {
                    row.style.display = '';
                });
                
                // Update pagination UI
                document.getElementById('current-page').textContent = currentPage;
                document.getElementById('total-pages').textContent = Math.max(1, totalPages);
                
                // Enable/disable buttons
                document.getElementById('first-page').disabled = currentPage === 1;
                document.getElementById('prev-page').disabled = currentPage === 1;
                document.getElementById('next-page').disabled = currentPage >= totalPages;
                document.getElementById('last-page').disabled = currentPage >= totalPages;
            }
            
            // Attach event listeners for filters
            document.getElementById('search-input').addEventListener('input', applyFilters);
            document.getElementById('status-filter').addEventListener('change', applyFilters);
            document.getElementById('browser-filter').addEventListener('change', applyFilters);
            document.getElementById('severity-filter').addEventListener('change', applyFilters);
            document.getElementById('feature-filter').addEventListener('change', applyFilters);
            
            // Attach event listeners for pagination
            document.getElementById('page-size').addEventListener('change', function() {
                currentPage = 1;
                applyPagination();
            });
            
            document.getElementById('first-page').addEventListener('click', function() {
                currentPage = 1;
                applyPagination();
            });
            
            document.getElementById('prev-page').addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    applyPagination();
                }
            });
            
            document.getElementById('next-page').addEventListener('click', function() {
                const totalPages = Math.ceil(filteredRows.length / pageSize);
                if (currentPage < totalPages) {
                    currentPage++;
                    applyPagination();
                }
            });
            
            document.getElementById('last-page').addEventListener('click', function() {
                currentPage = Math.ceil(filteredRows.length / pageSize);
                applyPagination();
            });
            
            // Clear filters
            document.getElementById('clear-filters').addEventListener('click', function() {
                document.getElementById('search-input').value = '';
                document.getElementById('status-filter').value = '';
                document.getElementById('browser-filter').value = '';
                document.getElementById('severity-filter').value = '';
                document.getElementById('feature-filter').value = '';
                applyFilters();
            });
            
            // Export functionality
            document.getElementById('export-csv').addEventListener('click', function() {
                exportToCSV(filteredRows);
            });
            
            document.getElementById('export-json').addEventListener('click', function() {
                exportToJSON(filteredRows);
            });
            
            // Initialize pagination
            applyPagination();
        }
        
        // Export to CSV
        function exportToCSV(rows) {
            const headers = ['Test Name', 'Status', 'Browser', 'Spec File', 'Duration (ms)', 'Retry', 'Severity', 'Feature', 'Error'];
            const csvRows = [headers.join(',')];
            
            rows.forEach(row => {
                const cells = Array.from(row.cells);
                const rowData = [
                    escapeCsvCell(cells[0]?.textContent || ''),
                    escapeCsvCell(cells[1]?.textContent.trim() || ''),
                    escapeCsvCell(cells[2]?.textContent.trim() || ''),
                    escapeCsvCell(cells[3]?.textContent.trim() || ''),
                    escapeCsvCell(cells[4]?.textContent.trim() || ''),
                    escapeCsvCell(cells[5]?.textContent.trim() || ''),
                    escapeCsvCell(cells[6]?.textContent.trim() || ''),
                    escapeCsvCell(cells[7]?.textContent.trim() || ''),
                    escapeCsvCell(cells[9]?.textContent.trim() || '')
                ];
                csvRows.push(rowData.join(','));
            });
            
            const csvContent = csvRows.join('\\n');
            downloadFile(csvContent, 'test-results.csv', 'text/csv');
        }
        
        // Export to JSON
        function exportToJSON(rows) {
            const results = [];
            
            rows.forEach(row => {
                const cells = Array.from(row.cells);
                results.push({
                    testName: cells[0]?.textContent || '',
                    status: cells[1]?.textContent.trim() || '',
                    browser: cells[2]?.textContent.trim() || '',
                    specFile: cells[3]?.textContent.trim() || '',
                    duration: cells[4]?.textContent.trim() || '',
                    retry: cells[5]?.textContent.trim() || '',
                    severity: cells[6]?.textContent.trim() || '',
                    feature: cells[7]?.textContent.trim() || '',
                    error: cells[9]?.textContent.trim() || ''
                });
            });
            
            const jsonContent = JSON.stringify(results, null, 2);
            downloadFile(jsonContent, 'test-results.json', 'application/json');
        }
        
        // Helper functions
        function escapeCsvCell(cell) {
            if (cell.includes(',') || cell.includes('"') || cell.includes('\\n')) {
                return '"' + cell.replace(/"/g, '""') + '"';
            }
            return cell;
        }
        
        function downloadFile(content, filename, contentType) {
            const blob = new Blob([content], { type: contentType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
        
        // Initialize filters on load
        document.addEventListener('DOMContentLoaded', initializeFilters);

        ${includeCharts ? this.getChartsScript(metrics) : ''}
        ${trendsData.length > 0 ? this.getTrendsChartsScript(trendsData) : ''}
    `;
  }

  private static getChartsScript(metrics: TestMetrics): string {
    return `
        // Charts initialization
        document.addEventListener('DOMContentLoaded', function() {
            // Overview Chart
            new Chart(document.getElementById('overview-chart'), {
                type: 'doughnut',
                data: {
                    labels: ['Passed', 'Failed', 'Skipped'],
                    datasets: [{
                        data: [${metrics.passed}, ${metrics.failed}, ${metrics.skipped}],
                        backgroundColor: ['#1ABB9C', '#E74C3C', '#3498DB']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: { display: false },
                    cutoutPercentage: 70
                }
            });

            // Browser Chart
            new Chart(document.getElementById('browser-chart'), {
                type: 'doughnut',
                data: {
                    labels: [${Object.keys(metrics.browserMetrics).map((b: string) => `'${b}'`).join(',')}],
                    datasets: [{
                        data: [${Object.values(metrics.browserMetrics).map((m: any) => m.passed + m.failed).join(',')}],
                        backgroundColor: ['#667eea', '#764ba2', '#f093fb']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: { display: false },
                    cutoutPercentage: 70
                }
            });

            // Error Categories Chart
            if (Object.keys(${JSON.stringify(metrics.errorCategories)}).length > 0) {
                new Chart(document.getElementById('error-chart'), {
                    type: 'pie',
                    data: {
                        labels: [${Object.keys(metrics.errorCategories).map((c: string) => `'${c}'`).join(',')}],
                        datasets: [{
                            data: [${Object.values(metrics.errorCategories).join(',')}],
                            backgroundColor: ['#E74C3C', '#F39C12', '#FFD119', '#3498DB', '#9f7aea', '#1ABB9C']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        legend: { position: 'bottom' }
                    }
                });
            }

            // Severity Chart
            new Chart(document.getElementById('severity-chart'), {
                type: 'bar',
                data: {
                    labels: [${Object.keys(metrics.severityMetrics).map((s: string) => `'${s.toUpperCase()}'`).join(',')}],
                    datasets: [{
                        label: 'Tests',
                        data: [${Object.values(metrics.severityMetrics).map((m: any) => m.total).join(',')}],
                        backgroundColor: '#667eea'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: { display: false },
                    scales: {
                        yAxes: [{ ticks: { beginAtZero: true } }]
                    }
                }
            });
        });
    `;
  }

  private static getTrendsChartsScript(trendsData: any[]): string {
    // Format timestamps for labels
    const labels = trendsData.map(t => {
      const date = new Date(t.timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    });
    
    const passRates = trendsData.map(t => t.passRate.toFixed(1));
    const totalTests = trendsData.map(t => t.totalTests);
    const passed = trendsData.map(t => t.passed);
    const failed = trendsData.map(t => t.failed);
    const durations = trendsData.map(t => (t.duration / 1000).toFixed(2));

    return `
        // Trends Charts
        document.addEventListener('DOMContentLoaded', function() {
            // Pass Rate Trend Chart
            const passRateTrendCtx = document.getElementById('pass-rate-trend-chart');
            if (passRateTrendCtx) {
                new Chart(passRateTrendCtx, {
                    type: 'line',
                    data: {
                        labels: ${JSON.stringify(labels)},
                        datasets: [{
                            label: 'Pass Rate (%)',
                            data: ${JSON.stringify(passRates)},
                            borderColor: '#1ABB9C',
                            backgroundColor: 'rgba(26, 187, 156, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 5,
                            pointBackgroundColor: '#1ABB9C',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverRadius: 7
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                ticks: {
                                    callback: function(value) { return value + '%'; }
                                }
                            }
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return 'Pass Rate: ' + context.parsed.y + '%';
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Test Count Trend Chart
            const testCountTrendCtx = document.getElementById('test-count-trend-chart');
            if (testCountTrendCtx) {
                new Chart(testCountTrendCtx, {
                    type: 'line',
                    data: {
                        labels: ${JSON.stringify(labels)},
                        datasets: [{
                            label: 'Total Tests',
                            data: ${JSON.stringify(totalTests)},
                            borderColor: '#3498DB',
                            backgroundColor: 'rgba(52, 152, 219, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 5,
                            pointBackgroundColor: '#3498DB',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverRadius: 7
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true }
                        },
                        plugins: {
                            legend: { display: false }
                        }
                    }
                });
            }

            // Duration Trend Chart
            const durationTrendCtx = document.getElementById('duration-trend-chart');
            if (durationTrendCtx) {
                new Chart(durationTrendCtx, {
                    type: 'line',
                    data: {
                        labels: ${JSON.stringify(labels)},
                        datasets: [{
                            label: 'Duration (s)',
                            data: ${JSON.stringify(durations)},
                            borderColor: '#9b59b6',
                            backgroundColor: 'rgba(155, 89, 182, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointRadius: 5,
                            pointBackgroundColor: '#9b59b6',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverRadius: 7
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { 
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) { return value + 's'; }
                                }
                            }
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return 'Duration: ' + context.parsed.y + 's';
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Pass/Fail Trend Chart
            const passFailTrendCtx = document.getElementById('pass-fail-trend-chart');
            if (passFailTrendCtx) {
                new Chart(passFailTrendCtx, {
                    type: 'line',
                    data: {
                        labels: ${JSON.stringify(labels)},
                        datasets: [
                            {
                                label: 'Passed',
                                data: ${JSON.stringify(passed)},
                                borderColor: '#1ABB9C',
                                backgroundColor: 'rgba(26, 187, 156, 0.1)',
                                borderWidth: 2,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 4,
                                pointBackgroundColor: '#1ABB9C'
                            },
                            {
                                label: 'Failed',
                                data: ${JSON.stringify(failed)},
                                borderColor: '#E74C3C',
                                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                                borderWidth: 2,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 4,
                                pointBackgroundColor: '#E74C3C'
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { 
                                beginAtZero: true,
                                stacked: false
                            }
                        },
                        plugins: {
                            legend: { 
                                display: true,
                                position: 'bottom'
                            }
                        }
                    }
                });
            }
        });
    `;
  }
}
