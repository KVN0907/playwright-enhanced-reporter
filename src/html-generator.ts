import { TestMetrics, TestResultDetail } from './types';

export interface HTMLGeneratorOptions {
  title?: string;
  includeCharts?: boolean;
  theme?: 'light' | 'dark' | 'auto';
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
      theme = 'auto'
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
        ${this.generateDetailsSection(testResults)}
    </div>

    <script>
        ${this.getJavaScript(metrics, includeCharts)}
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
                            <div class="metric-card duration">
                                <div class="metric-label">Total Duration</div>
                                <div class="metric-value">${(metrics.duration / 1000).toFixed(1)}s</div>
                                <div class="metric-subtitle">Avg: ${avgDuration}ms per test</div>
                            </div>
                            <div class="metric-card rate">
                                <div class="metric-label">Pass Rate</div>
                                <div class="metric-value">${passRate}%</div>
                                <div class="metric-subtitle">Target: ≥95%</div>
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
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Test Name</th>
                                        <th>Status</th>
                                        <th>Browser</th>
                                        <th>Spec File</th>
                                        <th>Duration</th>
                                        <th>Severity</th>
                                        <th>Feature</th>
                                        <th>Error</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${testResults.map(result => `
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
                                            <td><i class="fas fa-exclamation-triangle"></i> ${result.allureProperties?.severity || 'normal'}</td>
                                            <td><i class="fas fa-tag"></i> ${result.allureProperties?.feature || 'Unknown'}</td>
                                            <td style="max-width: 300px; word-wrap: break-word;">${this.escapeHtml(this.sanitizeErrorMessage(result.error))}</td>
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

        .fixed_height_320 .x_content {
            min-height: 240px;
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
            align-items: flex-start;
            gap: 30px;
            height: auto;
            min-height: 220px;
            padding: 20px 0;
            justify-content: flex-start;
        }

        .chart-visual {
            position: relative;
            width: 150px;
            height: 150px;
            flex-shrink: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 10px;
        }

        .chart-visual canvas {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 150px !important;
            height: 150px !important;
            z-index: 1 !important;
        }

        .chart-total {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            font-size: 2.0em !important;
            font-weight: bold !important;
            color: #333 !important;
            pointer-events: none !important;
            z-index: 100 !important;
            display: block !important;
            text-align: center !important;
            line-height: 1 !important;
            font-family: 'Roboto', sans-serif !important;
            background: rgba(255, 255, 255, 0.1) !important;
            border-radius: 50% !important;
            padding: 10px !important;
            min-width: 60px !important;
            min-height: 60px !important;
            box-sizing: border-box !important;
        }

        body.darkmode .chart-total {
            color: #b4bfca;
        }

        .chart-legend {
            flex: 1;
            min-width: 250px;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            gap: 8px;
            padding-top: 5px;
        }

        .legend-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 16px;
            border-bottom: 1px solid #efefef;
            min-height: 48px;
            background: #fafafa;
            border-radius: 4px;
            margin-bottom: 4px;
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
            gap: 12px;
            font-size: 0.9rem;
            font-weight: 500;
            flex: 1;
        }

        .legend-label i {
            width: 18px;
            text-align: center;
            font-size: 1rem;
            flex-shrink: 0;
        }

        .legend-percentage {
            font-weight: bold;
            font-size: 0.9rem;
            white-space: nowrap;
            color: #4a5568;
            min-width: 50px;
            text-align: right;
        }

        body.darkmode .legend-percentage {
            color: #b4bfca;
        }

        /* Metrics Grid */
        .metrics-grid {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 16px !important;
            align-items: stretch !important;
            margin: 20px 0 !important;
            padding: 0 10px !important;
            background: #f0f8ff !important; /* Light blue background for testing */
            border: 2px solid #1976d2 !important; /* Blue border for testing */
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
        .metric-card.duration { border-left-color: var(--md-info); }
        .metric-card.rate { border-left-color: var(--md-primary); }

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
        .metric-card.duration .metric-value { color: #3498DB; }
        .metric-card.rate .metric-value { color: #9f7aea; }

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
            border-collapse: collapse;
            margin: 10px 0;
        }

        .info-table td {
            padding: 15px 12px;
            border-bottom: 1px solid #efefef;
            font-size: 0.95rem;
            vertical-align: middle;
            line-height: 1.4;
        }

        .info-table td:first-child {
            font-weight: 600;
            width: 50%;
            color: #4a5568;
        }

        .info-table td:last-child {
            color: #2d3748;
            text-align: right;
            font-weight: 500;
        }

        .info-table tr:last-child td {
            border-bottom: none;
        }

        body.darkmode .info-table td {
            border-bottom-color: #2e2e2e;
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
        .data-table th:nth-child(1) { width: 25%; } /* Test Name */
        .data-table th:nth-child(2) { width: 8%; }  /* Status */
        .data-table th:nth-child(3) { width: 10%; } /* Browser */
        .data-table th:nth-child(4) { width: 15%; } /* Spec File */
        .data-table th:nth-child(5) { width: 8%; }  /* Duration */
        .data-table th:nth-child(6) { width: 8%; }  /* Severity */
        .data-table th:nth-child(7) { width: 10%; } /* Feature */
        .data-table th:nth-child(8) { width: 16%; } /* Error */

        .data-table td {
            padding: 15px 12px;
            border-bottom: 1px solid #E6E9ED;
            font-size: 0.9rem;
            vertical-align: middle; /* Changed back to middle for better alignment */
            line-height: 1.4;
            overflow: hidden; /* Prevent content overflow */
        }

        /* Test name column styling */
        .data-table td:nth-child(1) {
            font-weight: 600;
            word-wrap: break-word;
            word-break: break-word;
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
        .data-table td:last-child {
            max-width: 250px;
            word-wrap: break-word;
            word-break: break-word;
            white-space: pre-wrap;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.8rem;
            background: #f8f9fa;
            color: #dc3545;
            border-left: 3px solid #dc3545;
            padding-left: 15px;
            vertical-align: top; /* Top align for error messages */
        }

        body.darkmode .data-table td:last-child {
            background: #2a2a2a;
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

  private static getJavaScript(metrics: TestMetrics, includeCharts: boolean): string {
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

        ${includeCharts ? this.getChartsScript(metrics) : ''}
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
}
