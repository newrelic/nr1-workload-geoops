import React from 'react';
import PropTypes from 'prop-types';

export default class DetailsOverlay extends React.Component {
    static propTypes = {
        width: PropTypes.number,
        height: PropTypes.number,
    }

    render() {
        return <h1>Hello, details-overlay Nerdlet!</h1>;
    }
}
