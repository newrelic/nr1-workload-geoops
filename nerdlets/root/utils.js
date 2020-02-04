/*
 * Copyright 2019 New Relic Corporation. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import L from 'leaflet';
import { ChevronUp, ChevronDown } from 'react-feather';

export const generateIcon = mark => {
  const color = mark.status.color;
  return L.divIcon({
    className: 'marker',
    iconSize: [10, 10],
    html: `<span class="markerWrapper ${color}"></span>`,
  });
};

const noOrderCarets = (
  <div className="caretsContainer">
    <ChevronUp color="rgba(0,0,0, .3)" size={12} />
    <ChevronDown color="rgba(0,0,0, .3)" size={12} />
  </div>
);

const ascCaret = (
  <div className="caretsContainer sorted">
    <ChevronUp color="rgba(0,0,0, .8)" size={12} />
  </div>
);

const descCaret = (
  <div className="caretsContainer sorted">
    <ChevronDown color="rgba(0,0,0, .8)" size={12} />
  </div>
);

export const sortCaret = (order /*, column*/) => {
  if (!order) {
    return noOrderCarets;
  } else if (order === 'asc') {
    return ascCaret;
  } else if (order === 'desc') {
    return descCaret;
  }
  return null;
};
