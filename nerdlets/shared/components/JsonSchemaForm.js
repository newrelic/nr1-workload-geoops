import React from 'react';
import PropTypes from 'prop-types';

import Form from 'react-jsonschema-form';

export default class JsonSchemaForm extends React.PureComponent {
  static propTypes = {
    children: PropTypes.element,
    accountId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    guid: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    className: PropTypes.string,

    /* react-jsonschema-form pass-throughs */
    schema: PropTypes.object.isRequired,
    uiSchema: PropTypes.object,
    FieldTemplate: PropTypes.element,
    fields: PropTypes.object,
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
      document: this.initializeForm({ defaultValues: props.defaultValues }),
      errors: []
    };

    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
    this.handleOnError = this.handleOnError.bind(this);

    this.form = React.createRef();
    this.submit = this.submit.bind(this);
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

  initializeForm({ defaultValues }) {
    return defaultValues && typeof defaultValues === 'function'
      ? defaultValues()
      : {};
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

  handleOnChange({ formData }) {
    this.setState({ document: formData });
  }

  async handleOnSubmit({ formData }) {
    const { accountId, writeDocument, defaultValues } = this.props;

    const { data, error } = await writeDocument({
      accountId,
      document: formData
    });

    // TO DO - Can we rely on the response from the mutation to always be in data.nerdStorageWriteDocument?

    // Note: The mutation response from NerdStorage is different than fetching from NerdStorage
    // We wrap the response in document so that we gain some consistency in the way we access
    this.props.onWrite({
      document: { document: data.nerdStorageWriteDocument },
      error
    });

    this.setState({
      document: this.initializeForm({ defaultValues })
    });
  }

  handleOnError(errors) {
    this.props.onError(errors);
  }

  submit() {
    this.form.current.submit();
  }

  render() {
    const {
      children,
      schema,
      uiSchema,
      FieldTemplate,
      fields,
      className
    } = this.props;
    const { document, errors } = this.state;

    return (
      <>
        <Form
          schema={schema}
          uiSchema={uiSchema}
          FieldTemplate={FieldTemplate}
          fields={fields}
          formData={document}
          onChange={this.handleOnChange}
          onSubmit={this.handleOnSubmit}
          onError={this.handleOnError}
          className={className}
          ref={this.form}
        >
          {children}
        </Form>
        {errors && errors.length > 0 && (
          <pre>{JSON.stringify(errors, null, 2)}</pre>
        )}
      </>
    );
  }
}
