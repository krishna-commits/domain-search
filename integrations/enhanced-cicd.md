# Enhanced CI/CD Integration Examples

## GitHub Actions Enhanced Integration

```yaml
name: Enhanced Domain Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * *'  # Daily scans

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Comprehensive Security Scan
        uses: actions/github-script@v6
        with:
          script: |
            const response = await fetch('https://your-domain-scanner.com/api/domain?domain=${{ env.DOMAIN }}&profile=deep');
            const data = await response.json();
            
            // Check for critical issues
            if (data.penetrationTesting?.riskLevel === 'critical' || 
                data.threatIntelligence?.overallRisk === 'critical') {
              core.setFailed('Critical security issues detected');
            }
            
            // Post results as PR comment
            if (context.eventName === 'pull_request') {
              const comment = `## Security Scan Results
              
              **Overall Score:** ${data.securityScore}/100
              **Risk Level:** ${data.riskAssessment?.riskLevel}
              **Vulnerabilities:** ${data.vulnerabilities?.length || 0}
              **Penetration Testing:** ${data.penetrationTesting?.overallScore || 0}/100
              **Threat Intelligence:** ${data.threatIntelligence?.threatScore || 100}/100
              
              [View Full Report](${data.executiveReport?.url || '#'})
              `;
              
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: comment
              });
            }
            
            // Upload executive report
            const fs = require('fs');
            fs.writeFileSync('security-report.html', data.executiveReport?.html || '');
            
      - name: Upload Security Report
        uses: actions/upload-artifact@v3
        with:
          name: security-report
          path: security-report.html
```

## GitLab CI Enhanced Integration

```yaml
stages:
  - security

security-scan:
  stage: security
  image: node:20
  script:
    - |
      curl -X GET "https://your-domain-scanner.com/api/domain?domain=$DOMAIN&profile=deep" \
        -H "Authorization: Bearer $API_KEY" \
        -o scan-results.json
      
      # Parse results
      SCORE=$(jq -r '.securityScore' scan-results.json)
      RISK=$(jq -r '.riskAssessment.riskLevel' scan-results.json)
      PENETRATION=$(jq -r '.penetrationTesting.overallScore' scan-results.json)
      
      # Fail if critical
      if [ "$RISK" = "critical" ] || [ "$PENETRATION" -lt 70 ]; then
        echo "Critical security issues detected"
        exit 1
      fi
      
      # Generate report
      jq -r '.executiveReport.html' scan-results.json > security-report.html
  artifacts:
    paths:
      - scan-results.json
      - security-report.html
    reports:
      junit: scan-results.json
  only:
    - main
    - merge_requests
```

## Jenkins Enhanced Pipeline

```groovy
pipeline {
    agent any
    
    stages {
        stage('Security Scan') {
            steps {
                script {
                    def response = httpRequest(
                        url: "https://your-domain-scanner.com/api/domain?domain=${env.DOMAIN}&profile=deep",
                        authentication: 'api-key'
                    )
                    
                    def data = readJSON text: response.content
                    
                    // Check thresholds
                    if (data.penetrationTesting?.riskLevel == 'critical' ||
                        data.threatIntelligence?.overallRisk == 'critical') {
                        error('Critical security issues detected')
                    }
                    
                    // Generate report
                    writeFile file: 'security-report.html', text: data.executiveReport?.html ?: ''
                    
                    // Publish results
                    publishHTML([
                        reportName: 'Security Report',
                        reportDir: '.',
                        reportFiles: 'security-report.html',
                        reportTitles: 'Domain Security Report'
                    ])
                }
            }
        }
    }
    
    post {
        always {
            archiveArtifacts artifacts: 'security-report.html', fingerprint: true
        }
    }
}
```

## CircleCI Enhanced Integration

```yaml
version: 2.1

jobs:
  security-scan:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - run:
          name: Run Security Scan
          command: |
            curl -X GET "https://your-domain-scanner.com/api/domain?domain=$DOMAIN&profile=deep" \
              -H "Authorization: Bearer $API_KEY" \
              -o scan-results.json
            
            # Check results
            SCORE=$(jq -r '.securityScore' scan-results.json)
            if [ "$SCORE" -lt 70 ]; then
              echo "Security score below threshold"
              exit 1
            fi
            
            # Generate report
            jq -r '.executiveReport.html' scan-results.json > security-report.html
      - store_artifacts:
          path: security-report.html
          destination: security-report

workflows:
  version: 2
  security:
    jobs:
      - security-scan
```

