import React from 'react';
import PropTypes from 'prop-types';

import Form from 'react-jsonschema-form';

export default class JsonSchemaForm extends React.PureComponent {
  static propTypes = {
    accountId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    guid: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    schema: PropTypes.object.isRequired,
    uiSchema: PropTypes.object,
    defaultValues: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
    getDocument: PropTypes.func.isRequired,
    writeDocument: PropTypes.func.isRequired,
    onWrite: PropTypes.func,
    onError: PropTypes.func
    // TO DO - pass through event handlers for onChange/onSubmit/onError?
  };

  constructor(props) {
    super(props);

    this.state = {
      document:
        props.defaultValues && typeof props.defaultValues === 'function'
          ? props.defaultValues()
          : {},
      errors: []
    };

    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.handleOnError = this.handleOnError.bind(this);
  }

  async componentDidMount() {
    await this.load();
  }

  componentDidUpdate(prevProps) {
    if (this.props.guid !== prevProps.guid) {
      if (this.props.guid) {
        this.load();
      }
      return true;
    }

    return false;
  }

  async load() {
    const { accountId, guid, getDocument } = this.props;

    if (guid) {
      const { data, errors } = await getDocument({ accountId, guid });
      // console.log(data);
      // console.log(errors);

      this.setState({
        document: data,
        errors
      });
    }
  }

  // TO DO - figure out how to handle this
  handleOnChange({ formData }) {
    // console.log(formData);
    this.setState({ document: formData });
  }

  async handleOnSubmit({ formData }) {
    const { accountId, writeDocument } = this.props;

    const { data, error } = await writeDocument({
      accountId,
      document: formData
    });

    // TO DO - Can we rely on data.nerdStorageWriteDocument
    this.props.onWrite({ document: data.nerdStorageWriteDocument, error });
  }

  handleOnError(errors) {
    this.props.onError(errors);
  }

  render() {
    const { schema, uiSchema } = this.props;
    const { document, errors } = this.state;

    return (
      <>
        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={document}
          onChange={this.handleOnChange}
          onSubmit={this.handleOnSubmit}
          onError={this.handleOnError}
        />
        {errors && errors.length > 0 && (
          <pre>{JSON.stringify(errors, null, 2)}</pre>
        )}
      </>
    );
  }
}
