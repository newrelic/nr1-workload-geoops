import set from 'lodash.set';

const composeEntitySummary = (activeLocationEntities = []) => {
  if (activeLocationEntities.length > 0) {
    return activeLocationEntities.map(entity => {
      //      console.debug('If no alertSeverity, set to NOT_CONFIGURED');
      if (entity.alertSeverity == null)
        set(entity, 'alertSeverity', 'NOT_CONFIGURED');
      return {
        name: entity.name,
        alertSeverity: entity.alertSeverity,
        type: entity.type,
        guid: entity.guid,
        reporting: entity.reporting
      };
    });
  } else {
    return [
      {
        name: 'hi',
        alertSeverity: 'NOT_ALERTING',
        type: 'APPLICATION'
      }
    ];
  }
};

export default composeEntitySummary;
