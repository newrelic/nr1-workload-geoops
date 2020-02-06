import React from 'react';
import PropTypes from 'prop-types';

import { Grid, GridItem, Button } from 'nr1';

const Toolbar = function({ setParentState }) {
  return (
    <Grid>
      <GridItem columnSpan={4}>
        <Button
          onClick={() => setParentState({ addMapModal: true })}
          type={Button.TYPE.PRIMARY}
          iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
        >
          Add Map
        </Button>
        <Button
          onClick={() => setParentState({ addLocationModal: true })}
          type={Button.TYPE.PRIMARY}
          iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
        >
          Add Location
        </Button>

        <Button
          onClick={() => setParentState({ addMapLocationModal: true })}
          type={Button.TYPE.PRIMARY}
          iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
        >
          Add Location to Map
        </Button>

        <Button
          onClick={() => setParentState({ editMapModal: true })}
          type={Button.TYPE.PRIMARY}
          iconType={Button.ICON_TYPE.DOCUMENTS__DOCUMENTS__NOTES__A_ADD}
        >
          Edit Current Map
        </Button>
      </GridItem>
    </Grid>
  );
};

Toolbar.propTypes = {
  setParentState: PropTypes.func
};

export default Toolbar;
