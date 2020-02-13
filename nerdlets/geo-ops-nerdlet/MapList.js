import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Dropdown,
  DropdownItem,
  Grid,
  GridItem,
  Spinner,
  StackItem
} from 'nr1';

import { EmptyState, NerdGraphError } from '@newrelic/nr1-community';
import Toolbar from '../shared/components/Toolbar';

import { nerdStorageRequest } from '../shared/utils';
import { getMaps, deleteMap } from '../shared/services/map';

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
      maps: [],
      isLoading: true,
      loadingErrors: false
    };
  }

  async componentDidMount() {
    await this.loadMaps();
  }

  async loadMaps() {
    this.setState({ isLoading: true });

    // Maps
    const {
      data: maps = [],
      errors: loadingErrors = null
    } = await nerdStorageRequest({
      service: getMaps,
      errorState: 'loadingMaps',
      params: {}
    });

    this.setState({
      isLoading: false,
      maps,
      loadingErrors: loadingErrors || false
    });
  }

  async deleteMap({ map }) {
    console.log(map);
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
    const { isLoading, loadingErrors, maps } = this.state;

    if (isLoading) {
      return <Spinner />;
    }

    // TO DO - Fix NerdGraphError component in nr1-community
    // if (!isLoading && loadingErrors) {
    //   if (Array.isArray(loadingErrors)) {
    //     return loadingErrors.map((error, index) => {
    //       return <NerdGraphError key={index} error={error} />;
    //     });
    //   } else {
    //     return <NerdGraphError key={index} error={loadingErrors} />;
    //   }
    // }
    if (!isLoading && loadingErrors) {
      return <pre>{JSON.stringify(loadingErrors, null, 2)}</pre>;
    }

    const mapGridItems = maps.map(m => {
      const { document: map } = m;

      return (
        <GridItem columnSpan={4} key={map.guid}>
          <EmptyState
            heading={map.title || map.guid}
            buttonText="Edit Map"
            buttonOnClick={() => this.props.navigation.edit({ guid: map.guid })}
            // heading={map.guid}
            // buttonText="Delete Map"
            // buttonOnClick={() => this.deleteMap({ map: map })}
          />
          <Button onClick={() => this.deleteMap({ map: map })}>
            Delete Map
          </Button>
        </GridItem>
      );
    });

    return (
      <>
        <Toolbar
          left={<LeftToolbar onClick={this.props.navigation.back} />}
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
