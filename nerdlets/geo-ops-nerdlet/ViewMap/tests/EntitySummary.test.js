import composeEntitySummary from '../EntitySummary';
import { entitiesExamples } from './mocks';

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
        guid: 'R4DeKDYwfMAd3cKI1dTRVJ8QVBQTElDQVRJT058MzA1NjA5MDQ4',
        reporting: true
      },
      {
        name: 'EXAMPLE_DEV',
        alertSeverity: 'ALERTING',
        type: 'HOST',
        guid: 'wfMAd3cKI1dTRVJ8QVBQTElDQVRJT058MzAR4DeKDY',
        reporting: true
      }
    ]);
  });
});
