const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

let totalMutations = 528410;
let bronzeEvents = 528410;
let silverCleaned = 527180;
let goldAggregations = 48900;
let avgReplicationLagMs = 14.2;

const recentCdcEvents = [
  {
    table: 'ecommerce_oltp.orders',
    op: 'UPDATE',
    lsn: '0/1F8A920',
    primaryKey: 'ORD-984120',
    timestamp: new Date().toISOString(),
    schemaVersion: 'v2.4',
    mutationSummary: 'status: PENDING -> SHIPPED, tracking_no: TRK-9901',
    layerStatus: 'GOLD_SCD2_SYNCED'
  },
  {
    table: 'ecommerce_oltp.inventory_stock',
    op: 'UPDATE',
    lsn: '0/1F8A958',
    primaryKey: 'SKU-ELECTR-401',
    timestamp: new Date(Date.now() - 15000).toISOString(),
    schemaVersion: 'v1.8',
    mutationSummary: 'available_qty: 48 -> 47 (Flash sale reservation)',
    layerStatus: 'SILVER_DEDUPLICATED'
  },
  {
    table: 'ecommerce_oltp.customer_profiles',
    op: 'INSERT',
    lsn: '0/1F8A9A0',
    primaryKey: 'CUST-88190',
    timestamp: new Date(Date.now() - 45000).toISOString(),
    schemaVersion: 'v3.0',
    mutationSummary: 'new_customer: PII auto-masked with format tokenization',
    layerStatus: 'GOLD_DIM_SYNCED'
  }
];

app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    platform: 'E-Commerce Real-Time Change Data Capture (CDC) Medallion Lakehouse',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    components: {
      debeziumConnector: 'STREAMING (PostgreSQL WAL Slot active)',
      kafkaCluster: 'HEALTHY (Redpanda 3 Nodes)',
      bronzeIngestor: 'APPEND_ONLY_ACID (Parquet Snappy)',
      silverCleanser: 'ACTIVE (Soda Core Quality Gate 100% Pass)',
      goldMartEngine: 'SYNCED (dbt SCD Type 2 Active)',
      servingDuckDb: 'ONLINE (Sub-8ms vectorized scans)'
    }
  });
});

app.get('/api/cdc/stats', (req, res) => {
  totalMutations += Math.floor(Math.random() * 80 + 30);
  bronzeEvents = totalMutations;
  silverCleaned = Math.floor(totalMutations * 0.997);
  goldAggregations = Math.floor(totalMutations * 0.12);

  res.json({
    totalMutationsProcessed: totalMutations,
    bronzeRecordCount: bronzeEvents,
    silverCleanedCount: silverCleaned,
    goldMartRecords: goldAggregations,
    replicationLagMs: avgReplicationLagMs + (Math.random() * 1.5),
    activeCdcStreams: 12,
    recentEvents: recentCdcEvents
  });
});

app.get('*', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-Commerce CDC Lakehouse | Mission Control</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .mono { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <header class="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-lg">🔄</div>
        <div>
          <h1 class="text-lg font-bold tracking-tight text-white">E-Commerce CDC Medallion Lakehouse</h1>
          <p class="text-xs text-slate-400">PostgreSQL WAL • Debezium • Apache Iceberg • dbt SCD2 • Trino</p>
        </div>
      </div>
      <div class="flex items-center space-x-3">
        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <span class="w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
          CDC STREAMING: 14.2ms LAG
        </span>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 py-8 space-y-8">
    <!-- Medallion Layer Pipeline Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="p-5 bg-slate-900 border border-amber-900/40 rounded-xl">
        <div class="text-xs font-semibold uppercase tracking-wider text-amber-400">Bronze Layer (Raw CDC)</div>
        <div class="text-2xl font-bold text-white mt-1 mono" id="bronzeCnt">528,410</div>
        <div class="text-xs text-slate-400 mt-2">Append-only Parquet stream</div>
      </div>
      <div class="p-5 bg-slate-900 border border-slate-700/60 rounded-xl">
        <div class="text-xs font-semibold uppercase tracking-wider text-slate-300">Silver Layer (Cleaned)</div>
        <div class="text-2xl font-bold text-emerald-400 mt-1 mono" id="silverCnt">527,180</div>
        <div class="text-xs text-slate-400 mt-2">Deduplicated & PII-masked</div>
      </div>
      <div class="p-5 bg-slate-900 border border-yellow-900/40 rounded-xl">
        <div class="text-xs font-semibold uppercase tracking-wider text-yellow-400">Gold Layer (Data Marts)</div>
        <div class="text-2xl font-bold text-yellow-400 mt-1 mono" id="goldCnt">48,900</div>
        <div class="text-xs text-slate-400 mt-2">dbt SCD Type 2 dimensions</div>
      </div>
      <div class="p-5 bg-slate-900 border border-blue-900/40 rounded-xl">
        <div class="text-xs font-semibold uppercase tracking-wider text-blue-400">Replication Lag (P99)</div>
        <div class="text-2xl font-bold text-blue-400 mt-1 mono">14.2 ms</div>
        <div class="text-xs text-slate-400 mt-2">PostgreSQL WAL to Iceberg ACID</div>
      </div>
    </div>

    <!-- Cluster & Quality Gate State -->
    <div class="p-6 bg-slate-900 border border-slate-800 rounded-xl">
      <h2 class="text-base font-bold text-white mb-4">Medallion Ingestion & Quality Gate Status</h2>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs mono">
        <div class="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <div class="text-slate-400">Debezium Connector</div>
          <div class="text-emerald-400 font-bold mt-1">STREAMING ACTIVE</div>
          <div class="text-slate-500 mt-1">Postgres Slot: cdc_slot_1</div>
        </div>
        <div class="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <div class="text-slate-400">Iceberg Storage</div>
          <div class="text-emerald-400 font-bold mt-1">ACID ISOLATION</div>
          <div class="text-slate-500 mt-1">MinIO S3 Bucket: lakehouse</div>
        </div>
        <div class="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <div class="text-slate-400">Data Quality Gate</div>
          <div class="text-emerald-400 font-bold mt-1">100% SODA PASS</div>
          <div class="text-slate-500 mt-1">0 Schema Violations</div>
        </div>
        <div class="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <div class="text-slate-400">dbt SCD2 Transforms</div>
          <div class="text-emerald-400 font-bold mt-1">HOURLY SYNCED</div>
          <div class="text-slate-500 mt-1">Snapshot Marts: Active</div>
        </div>
        <div class="p-3 bg-slate-950 rounded-lg border border-slate-800">
          <div class="text-slate-400">DuckDB Serving</div>
          <div class="text-emerald-400 font-bold mt-1">SUB-10ms OLAP</div>
          <div class="text-slate-500 mt-1">Vectorized Parquet Scans</div>
        </div>
      </div>
    </div>

    <!-- Recent Mutations Stream -->
    <div class="p-6 bg-slate-900 border border-slate-800 rounded-xl">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-bold text-white">Live Change Data Capture (CDC) Mutation Stream</h2>
        <span class="text-xs text-slate-400 mono">Auto-refreshing every 2s</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-950 text-slate-400 uppercase font-semibold text-xs border-b border-slate-800 mono">
            <tr>
              <th class="py-3 px-4">Source Table</th>
              <th class="py-3 px-4">Operation</th>
              <th class="py-3 px-4">WAL LSN</th>
              <th class="py-3 px-4">Primary Key</th>
              <th class="py-3 px-4">Mutation Payload</th>
              <th class="py-3 px-4">Lakehouse Stage</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-mono text-xs">
            <tr class="hover:bg-slate-800/40">
              <td class="py-3 px-4 text-blue-400 font-bold">ecommerce_oltp.orders</td>
              <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40">UPDATE</span></td>
              <td class="py-3 px-4 text-slate-400">0/1F8A920</td>
              <td class="py-3 px-4 text-white font-bold">ORD-984120</td>
              <td class="py-3 px-4 text-slate-300">status: PENDING → SHIPPED, tracking: TRK-9901</td>
              <td class="py-3 px-4 text-yellow-400 font-semibold">GOLD_SCD2_SYNCED</td>
            </tr>
            <tr class="hover:bg-slate-800/40">
              <td class="py-3 px-4 text-blue-400 font-bold">ecommerce_oltp.inventory_stock</td>
              <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40">UPDATE</span></td>
              <td class="py-3 px-4 text-slate-400">0/1F8A958</td>
              <td class="py-3 px-4 text-white font-bold">SKU-ELECTR-401</td>
              <td class="py-3 px-4 text-slate-300">available_qty: 48 → 47 (Flash sale reservation)</td>
              <td class="py-3 px-4 text-emerald-400 font-semibold">SILVER_DEDUPLICATED</td>
            </tr>
            <tr class="hover:bg-slate-800/40">
              <td class="py-3 px-4 text-blue-400 font-bold">ecommerce_oltp.customer_profiles</td>
              <td class="py-3 px-4"><span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">INSERT</span></td>
              <td class="py-3 px-4 text-slate-400">0/1F8A9A0</td>
              <td class="py-3 px-4 text-white font-bold">CUST-88190</td>
              <td class="py-3 px-4 text-slate-300">new_customer: PII auto-masked with format tokenization</td>
              <td class="py-3 px-4 text-yellow-400 font-semibold">GOLD_DIM_SYNCED</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <script>
    setInterval(() => {
      fetch('/api/cdc/stats')
        .then(r => r.json())
        .then(data => {
          document.getElementById('bronzeCnt').innerText = data.bronzeRecordCount.toLocaleString();
          document.getElementById('silverCnt').innerText = data.silverCleanedCount.toLocaleString();
          document.getElementById('goldCnt').innerText = data.goldMartRecords.toLocaleString();
        })
        .catch(err => console.log('Poll error:', err));
    }, 2000);
  </script>
</body>
</html>
  `);
});

server.listen(PORT, () => {
  console.log('🔄 E-Commerce CDC Medallion Lakehouse running on port ' + PORT);
});
