import React, { PureComponent } from 'react';

import { navigation, NerdletStateContext, Spinner } from 'nr1';

import cloneDeep from 'lodash.clonedeep';

import EmptyState from './EmptyState/EmptyState';
import CreateMap from './CreateMap';
import ViewMap from './ViewMap/ViewMap';
import MapList from './MapList/MapList';

import { nerdStorageRequest } from '../shared/utils';
import { getMaps } from '../shared/services/map';
import { PACKAGE_UUID } from '../shared/constants';

const initialPages = {
  emptyState: false,
  createMap: false,
  viewMap: false,
  mapList: false
};

export default class index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      /*
       * Top-level "pages" - a poor man's navigation "router"
       */

      pages: { ...initialPages },

      /*
       * Local State
       */

      selectedMap: null,
      activeStep: null,
      maps: [],
      mapsLoading: true
    };
  }

  async componentDidMount() {
    await this.loadMaps();
  }

  async loadMaps() {
    // Maps
    const { data: maps = [] } = await nerdStorageRequest({
      service: getMaps,
      params: {}
    });

    this.setState({
      mapsLoading: false,
      maps,
      selectedMap: maps[0] ? maps[0].document : null,
      pages: {
        ...initialPages,
        emptyState: maps.length === 0,
        mapList: maps.length > 0
      }
    });
  }

  onMapChange = ({ map }) => {
    const { maps } = this.state;

    const mapObject = { guid: map.guid, document: map };

    const existing = maps.findIndex(m => map.guid === m.document.guid);
    if (existing !== -1) {
      const updatedMaps = [...maps];
      updatedMaps.splice(existing, 1, mapObject);

      this.setState({
        selectedMap: map,
        maps: updatedMaps
      });
    } else {
      this.setState(prevState => {
        return {
          maps: [...prevState.maps, mapObject]
        };
      });
    }
  };

  onMapDelete = ({ map }) => {
    this.setState(prevState => {
      const filteredMaps = prevState.maps.filter(
        m => map.guid !== m.document.guid
      );
      const newMaps = cloneDeep(filteredMaps);

      if (newMaps.length > 0) {
        return {
          maps: newMaps
        };
      }

      return {
        maps: newMaps,
        pages: {
          ...initialPages,
          emptyState: true
        }
      };
    });
  };

  router = ({ to, state }) => {
    const next = { ...initialPages };
    next[to] = true;

    const newState = {
      ...state
    };

    if (to === 'createMap') {
      if (!newState.selectedMap) {
        newState.selectedMap = null;
      }
    }

    this.setState({ pages: next, ...newState });
  };

  /*
   * Notes:
   *   This form of conditional rendering using multiple return statements with navigation callbacks will cause each component to unmount and re-mount on a "route" change.
   *   This has tradeoffs, which we may re-evaluate at some point in the future.
   */

  render() {
    const { pages, mapsLoading, maps, selectedMap, activeStep } = this.state;
    const { emptyState, createMap, viewMap, mapList } = pages;

    if (mapsLoading) {
      return <Spinner />;
    }

    if (!mapsLoading && emptyState) {
      return (
        <EmptyState
          navigation={{
            router: this.router
          }}
        />
      );
    }

    if (createMap) {
      return (
        <NerdletStateContext.Consumer>
          {nerdletState => {
            const { hasNewLocations = false } = nerdletState;

            // Reset the urlState
            if (hasNewLocations) {
              navigation.openLauncher(
                {
                  id: `${PACKAGE_UUID}.geo-ops`,
                  nerdlet: {
                    id: `geo-ops-nerdlet`,
                    urlState: {}
                  }
                },
                { replaceHistory: true }
              );
            }

            return (
              <CreateMap
                maps={maps}
                map={selectedMap}
                activeStep={activeStep}
                onMapChange={this.onMapChange}
                navigation={{
                  router: this.router
                }}
                hasNewLocations={hasNewLocations || null}
              />
            );
          }}
        </NerdletStateContext.Consumer>
      );
    }

    if (mapList) {
      return (
        <MapList
          maps={maps}
          onMapDelete={this.onMapDelete}
          navigation={{
            router: this.router
          }}
        />
      );
    }

    if (viewMap) {
      return (
        <ViewMap
          maps={maps}
          map={selectedMap}
          navigation={{
            router: this.router
          }}
        />
      );
    }
  }
}
