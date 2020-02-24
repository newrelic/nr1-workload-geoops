import React, { PureComponent } from 'react';

import { NerdletStateContext, Spinner } from 'nr1';

import EmptyState from './EmptyState';
import CreateMap from './CreateMap';
import ViewMap from './ViewMap';
import MapList from './MapList';
import EditMap from './EditMap';

import { nerdStorageRequest } from '../shared/utils';
import { getMaps } from '../shared/services/map';

export default class index extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      /*
       * Top-level "pages" - a poor man's navigation "router"
       */

      // We've queried for all Accounts and all Maps and found none
      emptyState: false,

      // Getting Started and Create new map
      createMap: false,

      // View Map
      viewMap: false,

      // Settings -> Map List
      mapList: false,

      // Settings -> Map List -> Edit Map/Edit Map Locations
      editMap: false,

      /*
       * Local State
       */

      // TO DO - Does Map selection live this high in the tree so we can pass it into Getting Started?
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
    // this.setState({ mapsLoading: true });

    // Maps
    const { data: maps = [] } = await nerdStorageRequest({
      service: getMaps,
      params: {}
    });

    this.setState({
      mapsLoading: false,
      maps,
      emptyState: maps.length === 0,
      mapList: maps.length > 0
    });
  }

  onMapDelete({ map }) {
    //
  }

  /*
   * Notes:
   *   This form of conditional rendering using multiple return statements with navigation callbacks will cause each component to unmount and re-mount on a "route" change.
   *   This has tradeoffs, which we may re-evaluate at some point in the future.
   */
  render() {
    const {
      emptyState,
      createMap,
      viewMap,
      mapList,
      editMap,

      mapsLoading,
      maps,
      selectedMap,
      activeStep
    } = this.state;

    if (mapsLoading) {
      return <Spinner />;
    }

    if (!mapsLoading && emptyState) {
      return (
        <EmptyState
          navigation={{
            next: () => this.setState({ emptyState: false, createMap: true }),
            back: () => {}
          }}
        />
      );
    }

    if (createMap) {
      return (
        <NerdletStateContext.Consumer>
          {nerdletState => {
            const { reload = false } = nerdletState;

            console.log(reload);

            return (
              <CreateMap
                map={selectedMap}
                activeStep={activeStep}
                onMapChange={({ map }) => {
                  // alert("You've created a new map and stored it in Account Storage!");
                  this.setState({ selectedMap: map.document });
                }}
                navigation={{
                  next: () =>
                    this.setState({ createMap: false, mapList: true }),
                  back: () =>
                    this.setState({ emptyState: false, createMap: true })
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
          onDelete={this.onMapDelete}
          navigation={{
            next: () => this.setState({ mapList: false, editMap: true }),
            back: () => this.setState({ emptyState: false, createMap: true }),
            create: () => this.setState({ mapList: false, createMap: true }),
            edit: ({ guid }) => {
              // const map = maps.find(m => m.document.guid === guid);

              this.setState({ mapList: false, editMap: true });
            },
            editWizard: ({ map, activeStep }) => {
              this.setState({
                mapList: false,
                createMap: true,
                selectedMap: map,
                activeStep
              });
            },
            viewMap: ({ map }) =>
              this.setState({
                mapList: false,
                viewMap: true,
                selectedMap: map
              }),
            gettingStarted: () => {
              this.setState({ mapsLoading: false, emptyState: true });
            }
          }}
        />
      );
    }

    if (editMap) {
      return (
        <EditMap
          navigation={{
            next: () => this.setState({ editMap: false, viewMap: true }),
            back: () => this.setState({ editMap: false, mapList: true }),
            createMap: () => this.setState({ editMap: false, createMap: true })
          }}
        />
      );
    }

    if (viewMap) {
      return <ViewMap map={selectedMap} />;
    }
  }
}
