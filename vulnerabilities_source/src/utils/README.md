# Cybersecurity CVE Dashboard

This project fetches the latest cybersecurity vulnerabilities (CVEs) directly from the official CVEProject GitHub Repository (cvelistV5), stores them in a Supabase database, and displays them on a React website with search and filtering features.

## Features

- Fetches CVE data directly from the CVEProject GitHub Repository
- Stores CVE data in a Supabase database
- Displays vulnerabilities with search and filtering
- Updates the CVE database regularly
- Shows statistics about the CVEs

## Implementation Details

### GitHub CVE Fetching

The application fetches CVE data from the CVEProject GitHub Repository using the GitHub API and raw content URLs. This approach avoids the need for an external API like NVD.

### Database Schema

The database schema includes a `cves` table with the following fields:
- `id`: Primary key (CVE ID)
- `cve_id`: CVE ID (e.g., CVE-2023-12345)
- `description`: Description of the vulnerability
- `published`: Publication date
- `last_modified`: Last modification date
- `base_score`: CVSS base score
- `base_severity`: CVSS base severity (CRITICAL, HIGH, MEDIUM, LOW)
- `vector_string`: CVSS vector string
- `cwe_ids`: Array of CWE IDs
- `reference_urls`: Array of reference URLs
- `created_at`: Record creation timestamp

### Updating Mechanism

The application includes a scheduler that periodically fetches the latest CVEs from the GitHub repository and updates the database. The update interval is configurable.

### UI Components

- `CVETable`: Displays a table of CVEs with search and filtering
- `CVEDetail`: Shows detailed information about a selected CVE
- `CVEStats`: Displays statistics about the CVEs
- `UpdateCVEButton`: Allows manual updates of the CVE database

## Deployment

This application can be deployed to Vercel or any other hosting platform that supports React applications.

## Future Improvements

- Add authentication for admin features
- Implement more advanced filtering options
- Add visualization of CVE trends over time
- Implement email notifications for new critical CVEs
- Add support for custom notes on CVEs
