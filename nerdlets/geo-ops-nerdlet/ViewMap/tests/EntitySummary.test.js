import composeEntitySummary from '../EntitySummary';

const entitiesExamples = [
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

describe('#EntitySummary', () => {
  test('should return array with single mocked object if no activeMapLocation passed', () => {
    expect(composeEntitySummary()).toStrictEqual([
      {
        name: 'hi',
        alertSeverity: 'NOT_ALERTING',
        type: 'APPLICATION'
      }
    ]);
  });
  test('should return array with single mocked object if activeMapLocation is an empty array', () => {
    expect(composeEntitySummary()).toStrictEqual([
      {
        name: 'hi',
        alertSeverity: 'NOT_ALERTING',
        type: 'APPLICATION'
      }
    ]);
  });
  test('should return correctly mapped entities if valid array of entities has been passed', () => {
    expect(composeEntitySummary(entitiesExamples)).toStrictEqual([
      {
        name: 'NERDSTORE_DEV',
        alertSeverity: 'NOT_ALERTING',
        type: 'APPLICATION',
        guid: 'R4DeKDYwfMAd3cKI1dTRVJ8QVBQTElDQVRJT058MzA1NjA5MDQ4'
      },
      {
        name: 'EXAMPLE_DEV',
        alertSeverity: 'ALERTING',
        type: 'HOST',
        guid: 'wfMAd3cKI1dTRVJ8QVBQTElDQVRJT058MzAR4DeKDY'
      }
    ]);
  });
});
