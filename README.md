# Xandeum pNode Analytics Dashboard

A real-time analytics platform for monitoring Xandeum storage provider nodes (pNodes). Built for the Xandeum Hackathon.

## 🚀 Features

- **Real-time Network Stats**: View total nodes, active nodes, storage capacity, and network health at a glance
- **Interactive Charts**: 
  - Top Storage Providers (Bar Chart)
  - Version Distribution (Pie Chart)
  - Uptime Distribution (Area Chart)
- **pNode List with Filtering**: Search, filter by status, and sort by various metrics
- **Individual Node Details**: Click on any pNode to see detailed information and historical charts
- **Auto-refresh**: Data automatically refreshes every 30 seconds
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **Language**: TypeScript

## 📡 pRPC Integration

The dashboard integrates with Xandeum's pRPC (Provider RPC) to fetch pNode data using the `get-pods-with-stats` method. The API returns:

```json
{
  "address": "109.199.96.218:9001",
  "is_public": true,
  "last_seen_timestamp": 1765204349,
  "pubkey": "2asTHq4vVGazKrmEa3YTXKuYiNZBdv1cQoLc1Tr2kvaw",
  "rpc_port": 6000,
  "storage_committed": 104857600,
  "storage_usage_percent": 0.024,
  "storage_used": 26069,
  "uptime": 3271,
  "version": "0.7.0"
}
```

## 🏃 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ovodo/xandeum-analytics.git
cd xandeum-analytics
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── pnodes/
│   │       └── route.ts      # API proxy for pRPC calls
│   ├── node/
│   │   └── [pubkey]/
│   │       └── page.tsx      # Individual node detail page
│   ├── layout.tsx            # Root layout with providers
│   ├── page.tsx              # Main dashboard page
│   └── globals.css           # Global styles
├── lib/
│   └── api.ts                # pRPC client and utility functions
└── types/
    └── pnode.ts              # TypeScript interfaces
```

## 🎯 Key Metrics Displayed

| Metric | Description |
|--------|-------------|
| Total pNodes | Total number of storage provider nodes |
| Active Nodes | Nodes seen in the last 5 minutes |
| Total Storage | Combined storage capacity across all nodes |
| Used Storage | Currently utilized storage |
| Avg Uptime | Average uptime across all nodes |
| Network Health | Overall network status indicator |

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env.local` file to configure custom endpoints:

```env
NEXT_PUBLIC_PRPC_ENDPOINT=https://apis.devnet.xandeum.com
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

MIT License - see LICENSE file for details.

## 🔗 Links

- [Xandeum Documentation](https://docs.xandeum.network)
- [Xandeum Discord](https://discord.gg/uqRSmmM5m)
- [Xandeum Website](https://xandeum.network)

---

Built with ❤️ for the Xandeum Hackathon
