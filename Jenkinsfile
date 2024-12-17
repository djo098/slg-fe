#!groovy
@Library([
    'jenkins-shared-library@v1.3',
    'jenkins-servicenow-library@v1.3',
    'jenkins-kiuwan-library@v2.2',
    'jenkins-mpl-library@v1.0',
    'jenkins-cloud-library@v4.10'
]) _

cloudPipeline {
    [
        name: "new-slg-front-end",
        
        modules: [
            [
                name: 'app',
                stack: 'node',
                azsufix: '02'
            ]
        ], 
        integrations: [
            serviceNow: [
                dev: 'a69e0fb71b029590156687b5604bcb1a',
                pre: 'a69e0fb71b029590156687b5604bcb1a',
                prd: 'a69e0fb71b029590156687b5604bcb1a' 
            ],
            kiuwan: [
                name: 'SLG2',
                isModule: true
            ],
            providers: [
                AZ: [
                    enabled: true,
                    resourceGroup: 'slg2-[env]-rg-01',
                    webApp: 'slg2-[env]-[module]-[sufix]' //webapp front
                ]
            ]
        ]
    ]
}