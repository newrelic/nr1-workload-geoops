import React from 'react';
import PropTypes from 'prop-types';

import Form from 'react-jsonschema-form';
import uuid from 'uuid/v4';

import JsonSchemaForm from './json-schema-form';

import { MAP_JSON_SCHEMA } from '../constants';

// eslint-disable-next-line no-unused-vars
import { getMaps, getMap, writeMap, deleteMap } from '../services/map';

const DEBUGGING = true;
const log = message => {
  if (DEBUGGING) {
    // eslint-disable-next-line no-console
    console.log(message);
  }
};

// Can we handle this with anything in JSON Schema?
const defaultValues = function() {
  return {
    guid: uuid()
  };
};

export default class MapForm extends React.PureComponent {
  static propTypes = {
    accountId: PropTypes.string,
    mapGuid: PropTypes.string,
    onCreate: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      document: null
    };

    this.writeMap = this.writeMap.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    if (this.props.mapGuid !== prevProps.mapGuid) {
      return true;
    }
    return false;
  }

  async load() {
    const { mapGuid } = this.props;

    if (mapGuid) {
      const { data, errors } = await getMap({ guid: mapGuid });

      // if (errors) {
      //   this.setState({
      //     errors
      //   });
      // }

      this.setState({
        document: data
      });
    }
  }

  handleOnChange() {
    //
  }

  async handleOnSubmit({ formData }) {
    await this.writeMap(formData);

    log(formData);
    this.props.onCreate({ formData });
  }

  handleOnError() {
    //
  }

  async fetchMap() {
    const { mapGuid } = this.props;
    await getMap({ mapGuid });
  }

  async writeMap({ formData }) {
    const { mapGuid } = this.props;
    await writeMap({ accountId: '630060', mapGuid, document: formData });
  }

  render() {
    const { isDefault, document } = this.state;

    // Here's our default journey for you to start with
    // TO DO - Add edit instructions etc.
    if (isDefault) {
      //
    }

    log(document);

    return (
      <JsonSchemaForm
        schema={MAP_JSON_SCHEMA}
        defaultValues={defaultValues()}
        getDocument={this.getMap}
        writeDocument={this.writeMap}
        onWrite={({ data, errors }) => console.log(errors)}
      />
    );
  }
}
