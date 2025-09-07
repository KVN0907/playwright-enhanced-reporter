import { TestMetrics, TestResultDetail } from './types';

export interface HTMLGeneratorOptions {
  title?: string;
  includeCharts?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export class EnhancedHTMLGenerator {
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
                                            <td style="max-width: 300px; word-wrap: break-word;">${result.error || '-'}</td>
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
        
        body {
            color: #73879C;
            background: #F7F7F7;
            font-family: "Helvetica Neue", Roboto, Arial, "Droid Sans", sans-serif;
            font-size: 13px;
            font-weight: 400;
            line-height: 1.471;
        }

        /* Dark Mode Styles */
        body.darkmode {
            background: #212121 !important;
            color: #b4bfca;
        }

        body.darkmode .x_panel {
            background: #1c1c21 !important;
            color: #b4bfca;
            border: 1px solid #2e2e2e;
        }

        body.darkmode .x_title {
            background: #1c1c21 !important;
            border-bottom: 2px solid #2e2e2e;
        }

        body.darkmode nav.navbar {
            background: #2b2b2b;
            border-bottom: 1px solid #313a45;
        }

        /* Navigation */
        nav.navbar {
            background: #EDEDED;
            border-bottom: 1px solid #D9DEE4;
            margin-bottom: 0;
            padding: 10px 20px;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .navbar-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
        }

        .navbar-brand {
            font-size: 18px;
            font-weight: 600;
            color: #5A738E;
            text-decoration: none;
        }

        .navbar-nav {
            display: flex;
            gap: 20px;
            list-style: none;
        }

        .nav-link {
            color: #5A738E;
            text-decoration: none;
            padding: 8px 12px;
            border-radius: 4px;
            transition: all 0.3s ease;
        }

        .nav-link:hover {
            background: #D9DEE4;
            color: #333;
        }

        .darkmode-toggle {
            background: none;
            border: none;
            font-size: 18px;
            color: #5A738E;
            cursor: pointer;
            padding: 8px;
            border-radius: 4px;
            transition: all 0.3s ease;
        }

        .darkmode-toggle:hover {
            background: #D9DEE4;
        }

        body.darkmode .darkmode-toggle {
            color: #b4bfca;
        }

        body.darkmode .darkmode-toggle:hover {
            background: #313a45;
        }

        /* Container */
        .main_container {
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .row {
            display: flex;
            flex-wrap: wrap;
            margin: 0 -15px;
            align-items: stretch;
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

        @media (max-width: 992px) {
            .col-lg-4 { 
                flex: 0 0 50%; 
                max-width: 50%; 
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
        }

        /* Panel Styles */
        .x_panel {
            position: relative;
            width: 100%;
            margin-bottom: 10px;
            display: flex;
            flex-direction: column;
            background: #fff;
            border: 1px solid #E6E9ED;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            overflow: hidden;
            height: 100%;
        }

        .x_title {
            border-bottom: 2px solid #E6E9ED;
            padding: 15px 20px;
            margin-bottom: 0;
            background: #f8f9fa;
            cursor: pointer;
            user-select: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }

        .x_title:hover {
            background: #e9ecef;
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
            color: #C5C7CB;
            font-size: 16px;
            text-decoration: none;
            padding: 5px;
            border-radius: 3px;
            transition: all 0.3s ease;
        }

        .collapse-link:hover {
            background: #F5F7FA;
            color: #5A738E;
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
            align-items: center;
            gap: 25px;
            height: auto;
            min-height: 220px;
            padding: 15px 0;
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
        }

        .chart-total {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2.0em;
            font-weight: bold;
            color: #333;
            pointer-events: none;
            z-index: 10;
            text-align: center;
        }

        body.darkmode .chart-total {
            color: #b4bfca;
        }

        .chart-legend {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 5px;
        }

        .legend-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #efefef;
            min-height: 45px;
        }

        .legend-item:last-child {
            border-bottom: none;
        }

        body.darkmode .legend-item {
            border-bottom-color: #2e2e2e;
        }

        .legend-label {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.95rem;
            font-weight: 500;
        }

        .legend-label i {
            width: 18px;
            text-align: center;
            font-size: 1rem;
        }

        .legend-percentage {
            font-weight: bold;
            font-size: 0.95rem;
            white-space: nowrap;
            color: #4a5568;
        }

        body.darkmode .legend-percentage {
            color: #b4bfca;
        }

        /* Metrics Grid */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 25px;
            align-items: stretch;
            margin: 10px 0;
        }

        .metric-card {
            background: white;
            padding: 30px 25px;
            border-radius: 12px;
            border-left: 4px solid #1ABB9C;
            text-align: center;
            box-shadow: 0 3px 12px rgba(0,0,0,0.08);
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 140px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.12);
        }

        .metric-card.failed { border-left-color: #E74C3C; }
        .metric-card.duration { border-left-color: #3498DB; }
        .metric-card.rate { border-left-color: #9f7aea; }

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
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            margin: 0;
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
        }

        .data-table td {
            padding: 15px 12px;
            border-bottom: 1px solid #E6E9ED;
            font-size: 0.9rem;
            vertical-align: middle;
        }

        /* Spec file column styling */
        .data-table td:nth-child(4) {
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
            color: #5A738E;
            max-width: 280px;
            word-wrap: break-word;
            word-break: break-all;
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
            padding: 6px 12px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .status-passed {
            background: #d4edda;
            color: #155724;
        }

        .status-failed {
            background: #f8d7da;
            color: #721c24;
        }

        .status-skipped {
            background: #d1ecf1;
            color: #0c5460;
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
                gap: 20px;
                padding: 20px 0;
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
                gap: 20px;
            }
            .navbar-container {
                padding: 0 15px;
            }
            .data-table th,
            .data-table td {
                padding: 12px 8px;
                font-size: 0.85rem;
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
