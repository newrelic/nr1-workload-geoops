import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Dropdown,
  DropdownItem,
  Grid,
  GridItem,
  Spinner,
  Stack,
  StackItem
} from 'nr1';

import { EmptyState, NerdGraphError } from '@newrelic/nr1-community';
import Toolbar from '../shared/components/Toolbar';

import { nerdStorageRequest } from '../shared/utils';
import { getMaps, deleteMap } from '../shared/services/map';
import { deleteLocations } from '../shared/services/location';
import { deleteMapLocationCollection } from '../shared/services/map-location';

const LeftToolbar = ({ onBack, onGettingStarted }) => {
  return (
    <>
      <StackItem className="toolbar-item has-separator">
        <Button onClick={onBack}>Back to main view</Button>
      </StackItem>
      <StackItem className="toolbar-item has-separator">
        <Button onClick={onGettingStarted}>Guided Setup</Button>
      </StackItem>
      {/* TO DO - Filtering maps by Account/Region/etc. */}
    </>
  );
};
LeftToolbar.propTypes = {
  onBack: PropTypes.func,
  onGettingStarted: PropTypes.func
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
    maps: PropTypes.array,
    navigation: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = {
      maps: props.maps || []
    };
  }

  async deleteMap({ map }) {
    const { maps } = this.state;

    try {
      await deleteMap({ map });
    } catch (e) {
      console.log(e);
    }

    this.setState({
      maps: maps.filter(m => m.document.guid !== map.guid)
    });
  }

  render() {
    const { maps } = this.state;

    const mapGridItems = maps.map(m => {
      const { document: map } = m;

      return (
        <GridItem columnSpan={4} key={map.guid}>
          <EmptyState
            heading={map.title || map.guid}
            buttonText="Edit Map"
            buttonOnClick={() => this.props.navigation.edit({ guid: map.guid })}
          />
          <Stack horizontalType={Stack.HORIZONTAL_TYPE.FILL_EVENLY}>
            <StackItem>
              <Button onClick={() => this.deleteMap({ map })}>
                Delete Map
              </Button>
            </StackItem>
            <StackItem>
              <Button
                onClick={() =>
                  this.props.navigation.editWizard({ map, activeStep: 2 })
                }
              >
                Guided Configuration
              </Button>
            </StackItem>
            <StackItem>
              <Button onClick={() => this.props.navigation.viewMap({ map })}>
                View Map
              </Button>
            </StackItem>
            <StackItem>
              <Button
                onClick={async () =>
                  deleteMapLocationCollection({
                    accountId: map.accountId,
                    mapGuid: map.guid
                  })
                }
              >
                Delete Markers
              </Button>
            </StackItem>
          </Stack>
        </GridItem>
      );
    });

    return (
      <>
        <Toolbar
          left={
            <LeftToolbar
              onBack={this.props.navigation.back}
              onGettingStarted={this.props.navigation.gettingStarted}
            />
          }
          right={<RightToolbar />}
        />

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
              {mapGridItems}
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
