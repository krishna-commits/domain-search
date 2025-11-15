/**
 * Jenkins Pipeline for Domain Security Scanning
 * 
 * This pipeline integrates domain security scanning into your CI/CD process
 * and blocks deployment if security requirements are not met.
 */

pipeline {
    agent any
    
    environment {
        DOMAIN = 'example.com'
        SECURITY_THRESHOLD = '80'
        SCANNER_URL = "${env.SCANNER_URL ?: 'http://localhost:3000'}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    echo '🔒 Running domain security scan...'
                    
                    // Run security scan
                    def response = sh(
                        script: """
                            curl -s -X GET "${SCANNER_URL}/api/domain?domain=${DOMAIN}" \
                                -H "Content-Type: application/json"
                        """,
                        returnStdout: true
                    ).trim()
                    
                    // Parse JSON response
                    def scanData = readJSON text: response
                    
                    // Extract metrics
                    def securityScore = scanData.securityScore ?: 0
                    def riskLevel = scanData.riskAssessment?.riskLevel ?: 'unknown'
                    
                    echo "Security Score: ${securityScore}/100"
                    echo "Risk Level: ${riskLevel}"
                    
                    // Save results
                    writeJSON file: 'scan-results.json', json: scanData
                    archiveArtifacts artifacts: 'scan-results.json', fingerprint: true
                    
                    // Check threshold
                    if (securityScore < Integer.parseInt(SECURITY_THRESHOLD)) {
                        error("❌ Security score ${securityScore} is below threshold of ${SECURITY_THRESHOLD}")
                    } else {
                        echo "✅ Security score meets requirements"
                    }
                }
            }
        }
        
        stage('Security Report') {
            steps {
                script {
                    def scanData = readJSON file: 'scan-results.json'
                    
                    // Generate HTML report
                    def htmlReport = """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <title>Domain Security Scan Report</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                .header { background: #4CAF50; color: white; padding: 20px; }
                                .score { font-size: 48px; font-weight: bold; }
                                .risk-high { color: #f44336; }
                                .risk-medium { color: #ff9800; }
                                .risk-low { color: #4CAF50; }
                                table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                                th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                                th { background-color: #4CAF50; color: white; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>Domain Security Scan Report</h1>
                                <p>Domain: ${scanData.domainDetails?.hostname ?: 'N/A'}</p>
                            </div>
                            <div class="score class="risk-${scanData.riskAssessment?.riskLevel ?: 'unknown'}">
                                Security Score: ${scanData.securityScore}/100
                            </div>
                            <h2>Risk Assessment</h2>
                            <p>Risk Level: <strong>${scanData.riskAssessment?.riskLevel?.toUpperCase() ?: 'UNKNOWN'}</strong></p>
                            <h2>Recommendations</h2>
                            <ul>
                                ${scanData.recommendations?.collect { "<li>${it}</li>" }.join('\n') ?: '<li>No recommendations</li>'}
                            </ul>
                        </body>
                        </html>
                    """
                    
                    writeFile file: 'security-report.html', text: htmlReport
                    publishHTML([
                        reportName: 'Security Scan Report',
                        reportDir: '.',
                        reportFiles: 'security-report.html',
                        keepAll: true
                    ])
                }
            }
        }
        
        stage('Notify') {
            steps {
                script {
                    def scanData = readJSON file: 'scan-results.json'
                    def securityScore = scanData.securityScore ?: 0
                    
                    // Send Slack notification
                    if (env.SLACK_WEBHOOK) {
                        def slackMessage = """
                            Domain Security Scan Complete
                            Domain: ${scanData.domainDetails?.hostname ?: 'N/A'}
                            Security Score: ${securityScore}/100
                            Risk Level: ${scanData.riskAssessment?.riskLevel?.toUpperCase() ?: 'UNKNOWN'}
                            Build: ${env.BUILD_URL}
                        """
                        
                        sh """
                            curl -X POST "${env.SLACK_WEBHOOK}" \
                                -H 'Content-Type: application/json' \
                                -d '{"text":"${slackMessage}"}'
                        """
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                expression { 
                    def scanData = readJSON file: 'scan-results.json'
                    return (scanData.securityScore ?: 0) >= Integer.parseInt(SECURITY_THRESHOLD)
                }
            }
            steps {
                echo '🚀 Deploying application...'
                // Your deployment steps here
            }
        }
    }
    
    post {
        always {
            // Archive scan results
            archiveArtifacts artifacts: 'scan-results.json', fingerprint: true
        }
        failure {
            echo '❌ Security scan failed or threshold not met'
        }
        success {
            echo '✅ Security scan passed'
        }
    }
}

