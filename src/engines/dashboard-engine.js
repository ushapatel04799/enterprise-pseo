import fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '../core/logger.js';
import { PseoError, ERROR_CODES } from '../core/errors.js';

/**
 * Dashboard Engine generating build analytics, execution logs, and premium HTML reports.
 */
class DashboardEngine {
  /**
   * Compiles JSON and HTML reports and saves them under generated/reports/.
   * @param {Record<string, any>} summary - The overall build summary.
   * @param {Array<Record<string, any>>} targetsDetail - Details for each processed target.
   */
  async generateReports(summary, targetsDetail) {
    const reportDir = path.resolve('generated/reports');
    logger.info('dashboard-engine', `Compiling reports under: ${reportDir}`);

    const reportJson = {
      projectId: 'enterprise-pseo',
      timestamp: new Date().toISOString(),
      summary,
      targets: targetsDetail,
    };

    try {
      await fs.mkdir(reportDir, { recursive: true });

      // 1. Write JSON Report
      const jsonPath = path.join(reportDir, 'build-report.json');
      await fs.writeFile(jsonPath, JSON.stringify(reportJson, null, 2), 'utf8');
      logger.info('dashboard-engine', `JSON build report saved to: ${jsonPath}`);

      // 2. Generate HTML Dashboard
      const htmlContent = this.buildHtmlDashboard(reportJson);
      const htmlPath = path.join(reportDir, 'dashboard.html');
      await fs.writeFile(htmlPath, htmlContent, 'utf8');
      logger.info('dashboard-engine', `HTML dashboard generated: ${htmlPath}`);

      return { jsonPath, htmlPath };
    } catch (err) {
      throw new PseoError(
        ERROR_CODES.GEN_FAIL,
        `Failed to compile dashboard reports: ${err.message}`,
        'dashboard-engine',
        'ERROR',
        'Verify directory permissions.',
        { error: err }
      );
    }
  }

  /**
   * Builds the interactive HTML dashboard template string.
   * @private
   */
  buildHtmlDashboard(data) {
    const successRate = data.summary.totalTargets > 0
      ? ((data.summary.successCount / data.summary.totalTargets) * 100).toFixed(1)
      : '0.0';

    const failRate = data.summary.totalTargets > 0
      ? ((data.summary.failedCount / data.summary.totalTargets) * 100).toFixed(1)
      : '0.0';

    // Calculate simulated API cost dynamically from targets usage metrics
    let costSum = 0;
    for (const t of data.targets) {
      if (t.metrics?.usage?.estimatedCost) {
        costSum += t.metrics.usage.estimatedCost;
      } else if (t.status === 'PASS' && !t.cached) {
        costSum += 0.015; // default fallback cost
      }
    }
    const totalCost = costSum.toFixed(4);

    const rowsHtml = data.targets.map(t => {
      const statusClass = t.status === 'PASS' ? 'status-pass' : 'status-fail';
      const fileLink = t.outputPath ? `<code>${t.outputPath.replace(/\\/g, '/')}</code>` : 'N/A';
      return `
        <tr>
          <td><strong>${t.state}</strong></td>
          <td>${t.city}</td>
          <td>${t.service}</td>
          <td><span class="badge ${statusClass}">${t.status}</span></td>
          <td><span class="score-pill score-${getScoreRange(t.score)}">${t.score || 0}/100</span></td>
          <td>${t.reason || 'N/A'}</td>
          <td>${fileLink}</td>
        </tr>
      `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PSEO Engine Build Dashboard</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0f172a;
      --accent: #f59e0b;
      --success: #10b981;
      --fail: #ef4444;
      --bg: #090d16;
      --card-bg: rgba(30, 41, 59, 0.4);
      --border: rgba(255, 255, 255, 0.08);
      --text: #f1f5f9;
      --text-muted: #94a3b8;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Outfit', sans-serif;
      background-color: var(--bg);
      background-image: radial-gradient(circle at 10% 20%, rgba(15, 23, 42, 0.6) 0%, rgba(9, 13, 22, 1) 90%);
      color: var(--text);
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
    }
    h1 {
      font-weight: 800;
      font-size: 2.25rem;
      background: linear-gradient(135deg, #ffffff 0%, var(--text-muted) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .timestamp {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
    }
    .card-title {
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
    .card-value {
      font-size: 2.25rem;
      font-weight: 800;
    }
    .value-success { color: var(--success); }
    .value-fail { color: var(--fail); }
    .value-accent { color: var(--accent); }

    .table-container {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      overflow-x: auto;
      backdrop-filter: blur(12px);
    }
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    h2 {
      font-size: 1.5rem;
      font-weight: 600;
    }
    .search-box {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      padding: 0.5rem 1rem;
      width: 300px;
      font-family: inherit;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th, td {
      padding: 1rem;
      border-bottom: 1px solid var(--border);
    }
    th {
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }
    tr:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-pass {
      background-color: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }
    .status-fail {
      background-color: rgba(239, 68, 68, 0.15);
      color: var(--fail);
    }
    .score-pill {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.875rem;
    }
    .score-good { background-color: rgba(16, 185, 129, 0.1); color: var(--success); }
    .score-warn { background-color: rgba(245, 158, 11, 0.1); color: var(--accent); }
    .score-bad { background-color: rgba(239, 68, 68, 0.1); color: var(--fail); }
  </style>
  <script>
    function filterTable() {
      const query = document.getElementById('search').value.toLowerCase();
      const rows = document.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    }
  </script>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>PSEO Engine Execution Report</h1>
        <div class="timestamp">Build Mode: <strong>${data.summary.mode}</strong> | Date: ${new Date(data.timestamp).toLocaleString()}</div>
      </div>
    </header>

    <div class="stats-grid">
      <div class="card">
        <div class="card-title">Total Targets</div>
        <div class="card-value">${data.summary.totalTargets}</div>
      </div>
      <div class="card">
        <div class="card-title">Passed Pages</div>
        <div class="card-value value-success">${data.summary.successCount}</div>
      </div>
      <div class="card">
        <div class="card-title">Failed Pages</div>
        <div class="card-value value-fail">${data.summary.failedCount}</div>
      </div>
      <div class="card">
        <div class="card-title">Build Success Rate</div>
        <div class="card-value value-success">${successRate}%</div>
      </div>
      <div class="card">
        <div class="card-title">Simulated Build Cost</div>
        <div class="card-value value-accent">$${totalCost}</div>
      </div>
    </div>

    <div class="table-container">
      <div class="table-header">
        <h2>Generated Targets Details</h2>
        <input type="text" id="search" onkeyup="filterTable()" placeholder="Search targets by city, service..." class="search-box" />
      </div>
      <table>
        <thead>
          <tr>
            <th>State</th>
            <th>City</th>
            <th>Service</th>
            <th>Audit Status</th>
            <th>Quality Score</th>
            <th>Failed Verification Reason</th>
            <th>Output Path</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
  }
}

// Helper to determine score range style
function getScoreRange(score) {
  if (!score) return 'bad';
  if (score >= 90) return 'good';
  if (score >= 80) return 'warn';
  return 'bad';
}

export const dashboardEngine = new DashboardEngine();
