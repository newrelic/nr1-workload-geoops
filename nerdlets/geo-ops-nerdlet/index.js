import React, { PureComponent } from 'react';

import { NerdletStateContext, Spinner } from 'nr1';

import cloneDeep from 'lodash.clonedeep';

import EmptyState from './EmptyState';
import CreateMap from './CreateMap';
import ViewMap from './ViewMap';
import MapList from './MapList';
import EditMap from './EditMap';

import { nerdStorageRequest } from '../shared/utils';
import { getMaps } from '../shared/services/map';

const initialPages = {
  emptyState: false,
  createMap: false,
  viewMap: false,
  mapList: false,
  editMap: false
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

    this.onMapDelete = this.onMapDelete.bind(this);
    this.onMapChange = this.onMapChange.bind(this);
    this.route = this.route.bind(this);
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

  onMapChange({ map }) {
    const { maps } = this.state;

    const mapObject = { guid: map.guid, document: map };

    const existing = maps.findIndex(m => map.guid === m.document.guid);
    if (existing !== -1) {
      const updatedMaps = [...maps];
      updatedMaps.splice(existing, 1, mapObject);

      this.setState({
        selectedMap: mapObject,
        maps: updatedMaps
      });
    } else {
      this.setState(prevState => {
        return {
          maps: [...prevState.maps, mapObject]
        };
      });
    }
  }

  onMapDelete({ map }) {
    this.setState(prevState => {
      const newMaps = prevState.maps.filter(m => map.guid !== m.document.guid);
      return {
        maps: cloneDeep(newMaps)
      };
    });
  }

  route({ to, state }) {
    const next = { ...initialPages };
    next[to] = true;
    this.setState({ pages: next, ...state });
  }

  /*
   * Notes:
   *   This form of conditional rendering using multiple return statements with navigation callbacks will cause each component to unmount and re-mount on a "route" change.
   *   This has tradeoffs, which we may re-evaluate at some point in the future.
   */

  render() {
    const { pages, mapsLoading, maps, selectedMap, activeStep } = this.state;
    const { emptyState, createMap, viewMap, mapList, editMap } = pages;

    if (mapsLoading) {
      return <Spinner />;
    }

    if (!mapsLoading && emptyState) {
      return (
        <EmptyState
          navigation={{
            router: this.route
          }}
        />
      );
    }

    if (createMap) {
      return (
        <NerdletStateContext.Consumer>
          {nerdletState => {
            const { reload = false } = nerdletState;

            return (
              <CreateMap
                map={selectedMap}
                activeStep={activeStep}
                onMapChange={this.onMapChange}
                navigation={{
                  router: this.route
                }}
                reload={reload || null}
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
            router: this.route
          }}
        />
      );
    }

    if (editMap) {
      return (
        <EditMap
          navigation={{
            router: this.route
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
            router: this.route
          }}
        />
      );
    }
  }
}
