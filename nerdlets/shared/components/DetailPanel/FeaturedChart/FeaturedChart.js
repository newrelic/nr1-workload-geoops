/* eslint-disable react/prop-types */
import React from 'react';

import get from 'lodash.get';

import { SparklineChart, Stack, StackItem } from 'nr1';

import { H6, StyledTooltip } from './styles';

const FeaturedChart = ({ map, mapLocation, openChartBuilder }) => {
  const accountId = map.accountId;
  const baseQuery = get(mapLocation, 'query', '');
  const query = baseQuery ? `${baseQuery} TIMESERIES` : baseQuery;

  return (
    <>
      {/* TODO: - We don't have this data. We built the data fetching into <GeoMap> so it only queries for those points that are visible */}
      {/* We would need to re-excute the query for _this_ MapLocation, or pull up the data fetching out of <GeoMap> */}
      {/* <Stack fullWidth className="detail-panel-featured-chart-header-container">
        <StackItem grow>
          <h6 className="detail-panel-featured-chart-header">
            Revenue overview
          </h6>
        </StackItem>

        <StackItem>
          <span className="detail-panel-featured-chart-comparison-stat negative">
            14.5%
          </span>
        </StackItem>
      </Stack> */}
      {accountId && query && (
        <>
          <Stack fullWidth>
            <StackItem grow>
              <H6>Location query</H6>
            </StackItem>

            <StackItem>
              <StyledTooltip text="Click to view the full query in the chart builder">
                <span onClick={() => openChartBuilder(query, accountId)}>
                  {query}
                </span>
              </StyledTooltip>
            </StackItem>
          </Stack>
          <SparklineChart accountId={accountId} query={query} />
        </>
      )}
    </>
  );
};

export default FeaturedChart;
