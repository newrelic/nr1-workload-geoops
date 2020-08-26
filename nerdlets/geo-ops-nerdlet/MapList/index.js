import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Grid, GridItem } from 'nr1';
import styled from 'styled-components';

import { ToolbarWrapper, MapItem } from '../components';
import RightToolbar from './Toolbars/RightToolbar';
import LeftToolbar from './Toolbars/LeftToolbar';

const StyledGrid = styled(Grid)`
  padding: 24px;
  background-color: #f4f5f5;
  height: calc(100% - 74px);

  div.map-grid {
    grid-gap: 16px;
  }
`;

const AddNewMapButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(9vw + 70px);
  border: 3px dashed #d5d7d7;
  border-radius: 4px;
  transition: all 0.05s ease-out;

  &:hover {
    cursor: pointer;
    border-color: #b9bdbd;
    transform: translateY(-2px);

    svg {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(1px);
  }

  svg {
    opacity: 0.75;
    transition: all 0.15s ease-out;
  }
`;

export default class MapList extends PureComponent {
  static propTypes = {
    maps: PropTypes.array,
    navigation: PropTypes.object,
    onMapDelete: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      maps: props.maps || []
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.maps !== this.props.maps) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ maps: this.props.maps });
    }
  }

  render() {
    const { navigation, onMapDelete } = this.props;
    const { maps } = this.state;

    const mapGridItems = maps.map(m => {
      const { document: map } = m;

      if (!map.guid) {
        return null;
      }

      return (
        <GridItem columnSpan={3} key={map.guid}>
          <MapItem
            map={map}
            navigation={navigation}
            onMapDelete={onMapDelete}
          />
        </GridItem>
      );
    });

    return (
      <>
        <ToolbarWrapper
          right={<RightToolbar navigation={navigation} />}
          left={<LeftToolbar />}
        />

        <StyledGrid
          spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
        >
          <GridItem columnSpan={12} fullHeight>
            <Grid className="map-grid">
              {mapGridItems}
              <GridItem columnSpan={3}>
                <AddNewMapButton
                  onClick={() =>
                    navigation.router({
                      to: 'createMap',
                      state: { selectedMap: null, activeStep: 1 }
                    })
                  }
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M47.75 22.375H26V0.625H22.375V22.375H0.625V26H22.375V47.75H26V26H47.75V22.375Z"
                      fill="#B9BDBD"
                    />
                  </svg>
                </AddNewMapButton>
              </GridItem>
            </Grid>
          </GridItem>
        </StyledGrid>
      </>
    );
  }
}
