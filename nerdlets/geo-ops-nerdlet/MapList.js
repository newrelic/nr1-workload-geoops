import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Button, Dropdown, DropdownItem, Grid, GridItem, StackItem } from 'nr1';
import { EmptyState } from '@newrelic/nr1-community';
import Toolbar from '../shared/components/Toolbar';

const LeftToolbar = ({ onClick }) => {
  return (
    <>
      <StackItem className="toolbar-item has-separator">
        <Button onClick={onClick}>Back to main view</Button>
      </StackItem>
      <StackItem>
        <Dropdown label="Account" title="Choose an Account">
          <DropdownItem>Account 1</DropdownItem>
          <DropdownItem>Account 2</DropdownItem>
          <DropdownItem>Account 3</DropdownItem>
        </Dropdown>
      </StackItem>
    </>
  );
};
LeftToolbar.propTypes = {
  onClick: PropTypes.func
};

const RightToolbar = () => {
  return (
    <>
      <StackItem className="">
        <Button>New Map</Button>
      </StackItem>
    </>
  );
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
    return (
      <>
        <Toolbar
          left={<LeftToolbar onClick={this.props.navigation.back} />}
          right={<RightToolbar />}
        />
        ;
        <Grid
          className="primary-grid"
          spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
        >
          <GridItem
            columnSpan={12}
            fullHeight
            className="locations-table-grid-item"
          >
            <Grid>
              <GridItem columnSpan={4}>
                <EmptyState
                  heading="Map 2"
                  buttonText="Edit Map"
                  buttonOnClick={() =>
                    this.props.navigation.edit({ guid: 'asdf-asdf-asdf-asdf' })
                  }
                />
              </GridItem>
              <GridItem columnSpan={4}>
                <EmptyState
                  heading="Map 2"
                  buttonText="Edit Map"
                  buttonOnClick={() =>
                    this.props.navigation.edit({ guid: 'asdf-asdf-asdf-asdf' })
                  }
                />
              </GridItem>
              <GridItem columnSpan={4}>
                <EmptyState
                  heading="Map 3"
                  buttonText="Edit Map"
                  buttonOnClick={() =>
                    this.props.navigation.edit({ guid: 'asdf-asdf-asdf-asdf' })
                  }
                />
              </GridItem>
              <GridItem columnSpan={4}>
                <EmptyState
                  heading="+"
                  buttonText="Create New Map"
                  buttonOnClick={this.props.navigation.create}
                />
              </GridItem>
            </Grid>
          </GridItem>
        </Grid>
      </>
    );
  }
}
