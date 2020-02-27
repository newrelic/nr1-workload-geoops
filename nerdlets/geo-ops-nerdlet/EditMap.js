import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Button, Dropdown, DropdownItem, Grid, GridItem, StackItem } from 'nr1';
import { EmptyState } from '@newrelic/nr1-community';
import MapLocationTable from '../shared/components/MapLocationTable';
import Toolbar from '../shared/components/Toolbar';

const LeftToolbar = ({ navigation }) => {
  return (
    <>
      <StackItem className="toolbar-item has-separator">
        <Button
          onClick={navigation.back}
          type={Button.TYPE.PLAIN}
          iconType={Button.ICON_TYPE.INTERFACE__CHEVRON__CHEVRON_LEFT}
        >
          Back to main view
        </Button>
      </StackItem>
      <StackItem className="toolbar-item has-separator">
        <Dropdown label="Account" title="Choose an Account">
          <DropdownItem>Account 1</DropdownItem>
          <DropdownItem>Account 2</DropdownItem>
          <DropdownItem>Account 3</DropdownItem>
        </Dropdown>
      </StackItem>
      <StackItem className="toolbar-item has-separator">
        <Dropdown label="Map" title="Choose a map">
          <DropdownItem>Map 1</DropdownItem>
          <DropdownItem>Map 2</DropdownItem>
          <DropdownItem>Map 3</DropdownItem>
        </Dropdown>
      </StackItem>
    </>
  );
};
LeftToolbar.propTypes = {
  navigation: PropTypes.object
};

const RightToolbar = ({ navigation }) => {
  return (
    <>
      <StackItem className="">
        <Button
          type={Button.TYPE.PRIMARY}
          onClick={() => console.log('Edit Locations')}
        >
          Edit Locations
        </Button>
      </StackItem>
      <StackItem className="">
        <Button type={Button.TYPE.PRIMARY} onClick={navigation.createMap}>
          New Map
        </Button>
      </StackItem>
    </>
  );
};
RightToolbar.propTypes = {
  navigation: PropTypes.object
};

export default class index extends PureComponent {
  static propTypes = {
    navigation: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      //
    };
  }

  render() {
    const { navigation } = this.props;

    return (
      <>
        <Toolbar
          left={<LeftToolbar navigation={navigation} />}
          right={<RightToolbar navigation={navigation} />}
        />

        <Grid
          className="primary-grid edit-map-primary-grid"
          spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
        >
          <GridItem
            columnSpan={3}
            fullHeight
            className="locations-table-grid-item"
          >
            <MapLocationTable />
          </GridItem>
          <GridItem className="primary-content-container" columnSpan={9}>
            {/* Edit Map Data */}

            {/* Edit Location Data */}

            <EmptyState heading="Edit Map Data" />
            <EmptyState heading="Edit Map Location Data" />
          </GridItem>
        </Grid>
      </>
    );
  }
}
