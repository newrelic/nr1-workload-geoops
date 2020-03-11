import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash.get';
import chunk from 'lodash.chunk';

import { NerdGraphQuery } from 'nr1';

const NG_QUERY = ({ accountId, queries }) => {
  return `
    {
      actor {
        account(id: ${accountId}) {
          ${queries}
        }
      }
    }
  `;
};

export default class BatchNrql extends React.PureComponent {
  static propTypes = {
    accountId: PropTypes.number,
    queries: PropTypes.arrayOf(
      PropTypes.shape({
        key: PropTypes.string.isRequired,
        query: PropTypes.string.isRequired
      })
    ),
    queryPrefix: PropTypes.string,
    children: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      allQueries: [],
      queryResults: {},
      queriesPerBatch: 5
    };

    this.handleResults = this.handleResults.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.queries !== this.props.queries) {
      this.load();
    }
  }

  load() {
    const { queryPrefix, queries } = this.props;

    const allQueries = queries.reduce((previousValue, currentValue) => {
      const { key, query } = currentValue;
      const name = key.replace(/-/gi, '');

      // previousValue[key] = `nrql(query: ${query})`;
      const line = `${queryPrefix}${name}: nrql(query: "${query}") {
        results
        totalResult
      }`;
      previousValue.push(line);
      return previousValue;
    }, []);

    // console.log(allQueries);

    this.setState({ allQueries }, this.batchProcess);
  }

  batchProcess() {
    const { accountId } = this.props;
    const { allQueries, queriesPerBatch } = this.state;

    const chunks = chunk(allQueries, queriesPerBatch);
    chunks.forEach(chunk => {
      const queries = chunk.join('\n');

      // TO DO - Somewhere in here we have an opportunity to create a unique list of queries
      // so we don't duplicate requests, we'll just need to map the results back to the guids

      const query = NG_QUERY({ accountId, queries });

      NerdGraphQuery.query({
        query,
        variables: {},
        fetchPolicyType: NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE
      }).then(this.handleResults);
    });
  }

  handleResults({ data, errors }) {
    const results = get(data, 'actor.account');

    const newResults = Object.entries(results).reduce(
      (previousValue, [key, value]) => {
        // TO DO - Add a default, maybe we need to let the user define this?
        // TO DO - Do we need to mandate they provide a NRQL Query with an alias, so we know how to get the result value?

        const result = get(value, "totalResult['average.duration']");

        previousValue[key] = result;
        return previousValue;
      },
      {}
    );
    // Loop through results, add to a map, add to this.state.queryResults

    this.setState(prevState => ({
      queryResults: {
        ...prevState.queryResults,
        ...newResults
      }
    }));
  }

  render() {
    const { children } = this.props;
    const { queryResults } = this.state;

    return children({ queryResults });
  }
}
