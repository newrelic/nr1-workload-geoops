import React from 'react';
import L from 'leaflet';
import { ChevronUp, ChevronDown } from 'react-feather';

export const generateIcon = mapLocation => {
  const { mostCriticalEntity } = mapLocation;
  const { alertSeverity } = mostCriticalEntity;

  // const color = mark.status.color || 'red';
  const colors = {
    green: '#13BA00',
    yellow: '#FFB951',
    red: '#FF0000',
    gray: '#8E9494',
    white: '#FFFFFF'
  };

  const severityToColor = {
    CRITICAL: 'red',
    WARNING: 'yellow',
    NOT_ALERTING: 'green',
    NOT_CONFIGURED: 'gray'
  };

  const color = colors[severityToColor[alertSeverity]];

  return L.divIcon({
    className: 'marker',
    iconSize: [10, 10],
    html: `
      <span>
        <svg
          width="35"
          height="44"
          viewBox="0 0 35 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M34.9903 18.0877C34.9968 17.8926 35 17.6967 35 17.5C35 7.83502 27.165 0 17.5 0C7.83502 0 0 7.83502 0 17.5C0 17.6967 0.00324409 17.8926 0.00968167 18.0877C0.00324823 18.1947 1.4916e-07 18.3027 0 18.4118C-1.23978e-05 29.7353 17.5 43.1176 17.5 43.1176C17.5 43.1176 35 29.7353 35 18.4118C35 18.3027 34.9967 18.1947 34.9903 18.0877Z"
            fill="#005054"
          />
          <path
            d="M27 17.5C27 22.7467 22.7467 27 17.5 27C12.2533 27 8 22.7467 8 17.5C8 12.2533 12.2533 8 17.5 8C22.7467 8 27 12.2533 27 17.5Z"
            fill="white"
          />
          <path
            d="M24 17.5C24 21.0899 21.0899 24 17.5 24C13.9101 24 11 21.0899 11 17.5C11 13.9101 13.9101 11 17.5 11C21.0899 11 24 13.9101 24 17.5Z"
            fill="${color || colors.white}"
          />
        </svg>
      </span>
    `
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

export const sortCaret = (order /* , column*/) => {
  if (!order) {
    return noOrderCarets;
  } else if (order === 'asc') {
    return ascCaret;
  } else if (order === 'desc') {
    return descCaret;
  }
  return null;
};
