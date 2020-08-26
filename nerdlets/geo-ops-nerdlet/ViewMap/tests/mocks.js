export const entitiesExamples = [
  {
    __typename: 'BrowserApplicationEntity',
    accountId: 123456,
    alertSeverity: 'NOT_ALERTING',
    alertViolations: [],
    domain: 'BROWSER',
    guid: 'R4DeKDYwfMAd3cKI1dTRVJ8QVBQTElDQVRJT058MzA1NjA5MDQ4',
    name: 'NERDSTORE_DEV',
    recentAlertViolations: [],
    reporting: true,
    tags: [],
    type: 'APPLICATION'
  },
  {
    __typename: 'BrowserApplicationEntity',
    accountId: 123456,
    alertSeverity: 'ALERTING',
    alertViolations: [],
    domain: 'BROWSER',
    guid: 'wfMAd3cKI1dTRVJ8QVBQTElDQVRJT058MzAR4DeKDY',
    name: 'EXAMPLE_DEV',
    recentAlertViolations: [],
    reporting: true,
    tags: [],
    type: 'HOST'
  }
];

export const locationExample = {
  contactEmail: 'foo@foo.com',
  entities: [
    {
      __typename: 'BrowserApplicationEntity',
      accountId: 630060,
      alertSeverity: 'NOT_ALERTING',
      alertViolations: [],
      domain: 'BROWSER',
      guid: 'NjMwMDYwfEJST1dTRVJ8QVBQTElDQVRJT058MzA1NjA5MDQ4',
      name: 'NERDSTORE_DEV',
      recentAlertViolations: [
        {
          __typename: 'EntityAlertViolation',
          agentUrl:
            'https://rpm.newrelic.com/accounts/630060/browser/305609048?tw[start]=1592127570&tw[end]=1592129370',
          alertSeverity: 'CRITICAL',
          closedAt: 1592128680000,
          label: "'EndUser' > 3 for at least 5 minutes",
          level: '3',
          openedAt: 1592128260000,
          violationId: 947290235,
          violationUrl:
            'https://alerts.newrelic.com/accounts/630060/incidents/135327142/violations?id=947290235'
        }
      ],
      reporting: true,
      tags: [
        {
          __typename: 'EntityTag',
          key: 'account',
          values: ['Origami Financial Services']
        }
      ],
      type: 'APPLICATION'
    },
    {
      __typename: 'InfrastructureHostEntity',
      accountId: 123456,
      alertSeverity: 'NOT_ALERTING',
      alertViolations: [],
      domain: 'INFRA',
      guid: 'NjMwMDYwfElORlJBfE5BfDE4NTE1MTc2ODU4NDA0MzIzMzg',
      name: '123456',
      recentAlertViolations: [
        {
          __typename: 'EntityAlertViolation',
          agentUrl:
            'https://infrastructure.newrelic.com/accounts/123456/alertLanding?violationId=812901770',
          alertSeverity: 'WARNING',
          closedAt: 1584725940000,
          label:
            "CPU % > 10 for at least 2 minutes on 'ldap_0.origamifinancialservices.com'",
          level: '2',
          openedAt: 1584725940000,
          violationId: 812901770,
          violationUrl: null
        }
      ],
      reporting: true,
      tags: [
        {
          __typename: 'EntityTag',
          key: 'account',
          values: ['123456']
        }
      ],
      type: 'HOST'
    },
    {
      __typename: 'InfrastructureHostEntity',
      accountId: 123456,
      alertSeverity: 'NOT_ALERTING',
      alertViolations: [],
      domain: 'INFRA',
      guid: 'NjMwMDYwfElORlJBfE5BfDE4MTAyMjQzNTExNzkxOTQzOTE',
      name: '123456',
      recentAlertViolations: [],
      reporting: true,
      tags: [
        {
          __typename: 'EntityTag',
          key: 'account',
          values: ['Origami Financial Services']
        }
      ],
      type: 'HOST'
    },
    {
      __typename: 'GenericInfrastructureEntity',
      accountId: 123456,
      alertSeverity: 'NOT_ALERTING',
      alertViolations: [],
      domain: 'INFRA',
      guid: 'NjMwMDYwfElORlJBfE5BfDEzNTgyMjU1ODk4MjI1OTMzMTE',
      name: '123456',
      recentAlertViolations: [],
      reporting: true,
      tags: [
        {
          __typename: 'EntityTag',
          key: 'account',
          values: ['123456']
        }
      ],
      type: 'AWSRDSDBINSTANCE'
    },
    {
      __typename: 'InfrastructureHostEntity',
      accountId: 123456,
      alertSeverity: 'NOT_ALERTING',
      alertViolations: [],
      domain: 'INFRA',
      guid: 'MjUwMTE3NXxJTkZSQXxOQXw2NDMwMzMwNDE0MzQ2ODI4ODgz',
      name: '123456',
      recentAlertViolations: [],
      reporting: true,
      tags: [
        {
          __typename: 'EntityTag',
          key: 'account',
          values: ['123456']
        }
      ],
      type: 'HOST'
    },
    {
      __typename: 'DashboardEntity',
      accountId: 123456,
      domain: 'VIZ',
      guid: 'NjMwMDYwfFZJWnxEQVNIQk9BUkR8NzUxNTQ3',
      name: 'Browser Users Dashboard',
      reporting: true,
      tags: [
        {
          __typename: 'EntityTag',
          key: 'account',
          values: ['Origami Financial Services']
        }
      ],
      type: 'DASHBOARD'
    },
    {
      __typename: 'DashboardEntity',
      accountId: 123456,
      domain: 'VIZ',
      guid: 'NjMwMDYwfFZJWnxEQVNIQk9BUkR8NzA2MzI2',
      name: 'Joey Bagels',
      reporting: true,
      tags: [
        {
          __typename: 'EntityTag',
          key: 'account',
          values: ['123456']
        }
      ],
      type: 'DASHBOARD'
    },
    {
      __typename: 'WorkloadEntity',
      accountId: 123456,
      domain: 'NR1',
      guid: 'NjMwMDYwfE5SMXxXT1JLTE9BRHw1ODM',
      name: 'Infra GeoOps Store #2',
      reporting: true,
      tags: [
        {
          __typename: 'EntityTag',
          key: 'account',
          values: ['123456']
        }
      ],
      type: 'WORKLOAD'
    }
  ],
  externalId: '183',
  guid: '5d347087-4388-4d18-93a4-97f2e9f2b931',
  location: {
    country: 'USA',
    description: 'Nulla quis tortor orci. Etiam at risus et justo dignissim.',
    lat: '33.093868',
    lng: '-96.82122070000003',
    municipality: 'Frisco',
    postalCode: '75034',
    region: 'TX'
  },
  map: '56981480-eafa-4cf3-9682-6f1dde7f9f94',
  query:
    "FROM Transaction SELECT average(duration) FACET entityGuid, appName WHERE entityGuid in ('NjMwMDYwfEFQTXxBUFBMSUNBVElPTnw2MDgwNzg2')",
  runbookUrl:
    'https://docs.google.com/document/d/1NOWVNqJ9G8Ks5jIf2HVRj2CLP0Mjui1FsaIqs7kXy-Y/edit',
  title: '7171 Ikea Dr',
  alertViolations: [],
  recentAlertViolations: [
    {
      __typename: 'EntityAlertViolation',
      agentUrl:
        'https://rpm.newrelic.com/accounts/123456/browser/305609048?tw[start]=1592127570&tw[end]=1592129370',
      alertSeverity: 'CRITICAL',
      closedAt: 1592128680000,
      label: "'EndUser' > 3 for at least 5 minutes",
      level: '3',
      openedAt: 1592128260000,
      violationId: 947290235,
      violationUrl:
        'https://alerts.newrelic.com/accounts/123456/incidents/135327142/violations?id=947290235'
    }
  ],
  favorite: false,
  mostCriticalEntity: {
    __typename: 'BrowserApplicationEntity',
    accountId: 123456,
    alertSeverity: 'NOT_ALERTING',
    alertViolations: [],
    domain: 'BROWSER',
    guid: 'NjMwMDYwfEJST1dTRVJ8QVBQTElDQVRJT058MzA1NjA5MDQ4',
    name: '123456',
    recentAlertViolations: [
      {
        __typename: 'EntityAlertViolation',
        agentUrl:
          'https://rpm.newrelic.com/accounts/123456/browser/305609048?tw[start]=1592127570&tw[end]=1592129370',
        alertSeverity: 'CRITICAL',
        closedAt: 1592128680000,
        label: "'EndUser' > 3 for at least 5 minutes",
        level: '3',
        openedAt: 1592128260000,
        violationId: 947290235,
        violationUrl:
          'https://alerts.newrelic.com/accounts/123456/incidents/135327142/violations?id=947290235'
      }
    ],
    reporting: true,
    tags: [
      {
        __typename: 'EntityTag',
        key: 'account',
        values: ['123456']
      }
    ],
    type: 'APPLICATION'
  },
  lastIncidentTime: 'N/A'
};
