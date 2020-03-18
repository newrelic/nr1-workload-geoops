/* eslint-disable react/no-did-update-set-state */
import React from 'react';
import PropTypes from 'prop-types';

import Form from 'react-jsonschema-form';

import { Spinner } from 'nr1';

export default class JsonSchemaForm extends React.PureComponent {
  /*
   * Data is supplied to the form through a combination of the `formData` and
   * `fetchDocument` props.
   *
   * Providing both allows for us to optionally fetch
   * the document on form load (to avoid issues with stale objects in state),
   * while providing the rest of the UI a way to override some of that data with
   * user input.
   *
   * i.e. Any supplied `formData` will overwrite that retrieved from NerdStorage if `fetchDocument` is provided
   * and will be the only data when `fetchDocument` isn't provided
   */
  static propTypes = {
    children: PropTypes.element,
    className: PropTypes.string,

    /*
     * react-jsonschema-form props
     */
    schema: PropTypes.object.isRequired,
    uiSchema: PropTypes.object,
    defaultValues: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
    formData: PropTypes.object,
    onError: PropTypes.func,
    onChange: PropTypes.func,
    // onSubmit: PropTypes.func,

    /* Nerd Storage "service" interactions */

    /*
     * Function to call to retrieve the document from nerd storage
     * ex. shared/services/map-location.js -> getMapLocation()
     */
    fetchDocument: PropTypes.func,

    /*
     * NerdStorage is a document store, and only stores values as strings
     * JSON Schema driven forms demand that data be cast to the correct input type
     *
     * After fetching a document from NerdStorage, provide a hook to "type cast"
     * any numbers/floats/etc. to their appropriate type (from string)
     */
    formatDocument: PropTypes.func,

    /*
     * Nerdstorage api call to save the document
     */
    writeDocument: PropTypes.func.isRequired,

    /*
     * Handler for the call to write the document to NerdStorage
     */
    onWrite: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
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

  async componentDidUpdate(prevProps) {
    const fetchDocument = this.props.fetchDocument !== prevProps.fetchDocument;
    const formData = this.props.formData !== prevProps.formData;

    if (fetchDocument || formData) {
      if (fetchDocument) {
        await this.load();
      }

      if (formData) {
        this.setState(prevState => ({
          document: {
            ...prevState.document,
            ...this.props.formData
          }
        }));
      }
      return true;
    }

    return false;
  }

  isFunc(func) {
    if (func && typeof func === 'function') {
      return true;
    }
    return false;
  }

  initializeForm({ defaultValues }) {
    return this.isFunc(defaultValues) ? defaultValues() : {};
  }

  async load() {
    const { fetchDocument, formatDocument } = this.props;

    if (!this.isFunc(fetchDocument)) {
      return;
    }

    this.setState({ isLoading: true });
    const { data, errors } = await fetchDocument();
    this.setState({ isLoading: false });

    // console.log(data);
    // console.log(errors);

    const formattedDocument = this.isFunc(formatDocument)
      ? formatDocument(data)
      : data;

    this.setState({
      document: formattedDocument,
      errors
    });
  }

  handleOnChange({ formData }) {
    const { onChange } = this.props;

    this.setState({ document: formData });

    if (this.isFunc(onChange)) {
      onChange({ formData });
    }
  }

  async handleOnSubmit({ formData }) {
    const { writeDocument, defaultValues } = this.props;

    const { data, error } = await writeDocument({
      formData
    });

    // TO DO - Can we rely on the response from the mutation to always be in data.nerdStorageWriteDocument?

    // Note: The mutation response from NerdStorage is different than fetching from NerdStorage
    // We wrap the response in document so that we gain some consistency in the way we access
    const document = data.nerdStorageWriteDocument;
    this.props.onWrite({
      data: { guid: document.guid, document },
      error
    });

    this.setState({
      document: this.initializeForm({ defaultValues })
    });
  }

  handleOnError(errors) {
    const { onError } = this.props;

    if (this.isFunc(onError)) {
      onError(errors);
    }
  }

  submit() {
    this.form.current.submit();
  }

  render() {
    const { children, schema, uiSchema, className } = this.props;
    const { document, errors, isLoading } = this.state;

    return (
      <>
        {isLoading && <Spinner />}

        {errors && errors.length > 0 && (
          <pre>{JSON.stringify(errors, null, 2)}</pre>
        )}

        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={document}
          onChange={this.handleOnChange}
          onSubmit={this.handleOnSubmit}
          onError={this.handleOnError}
          className={className}
          ref={this.form}
        >
          {children}
        </Form>
      </>
    );
  }
}
