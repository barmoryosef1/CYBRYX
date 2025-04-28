# CYBRYX

A comprehensive threat intelligence platform that aggregates data from multiple sources including VirusTotal, OTX, ThreatFox, URLhaus, and AbuseIPDB.

## Features

- Multi-source threat intelligence aggregation
- Real-time IP, domain, URL, and file hash analysis
- Risk score calculation based on multiple sources
- Beautiful and modern UI with dark mode support
- Detailed analysis views for each intelligence source
- API integration with major threat intelligence platforms

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- AbuseIPDB API key
- Other API keys as needed (VirusTotal, OTX, etc.)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cybryx.git
cd cybryx
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory and add your API keys:
```env
VITE_ABUSEIPDB_API_KEY=your_api_key_here
```

## Development

To run the development server:

```bash
npm run dev:all
```

This will start:
- Vite development server for the frontend
- Proxy server for API requests

## Building for Production

```bash
npm run build
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Code Quality

The project uses:
- ESLint for code linting
- Prettier for code formatting
- Husky for Git hooks
- lint-staged for pre-commit checks

To format code:
```bash
npm run format
```

## Project Structure

```
src/
├── components/     # React components
├── services/      # API and service integrations
├── pages/         # Page components
├── lib/           # Utility functions
├── styles/        # Global styles
└── server/        # Backend proxy server
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [VirusTotal](https://www.virustotal.com/)
- [AbuseIPDB](https://www.abuseipdb.com/)
- [AlienVault OTX](https://otx.alienvault.com/)
- [ThreatFox](https://threatfox.abuse.ch/)
- [URLhaus](https://urlhaus.abuse.ch/)
