import React from 'react';
import PropTypes from 'prop-types';
import { AccountsQuery, Spinner } from 'nr1';

export default class AccountDropdown extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    onChange: PropTypes.func,
    style: PropTypes.object,
    formData: PropTypes.number
  };

  constructor(props) {
    super(props);

    this.state = {
      accounts: null,
      selected: null
    };
  }

  async componentDidMount() {
    await Promise.all([this.loadAccounts()]);
  }

  async componentDidUpdate(prevProps, prevState) {
    const prevAccount = prevState.selected;
    const account = this.state.selected;

    if (account && (!prevAccount || account.id !== prevAccount.id)) {
      this.props.onChange(account.id);
    }

    if (this.props.formData !== prevProps.formData) {
      this.setSelectedAccountFromProps();
    }
  }

  async loadAccounts() {
    await this.loadAccountsWithAccountsQuery();
  }

  handleLoadAccountsResponse({ accounts }) {
    const { formData: accountId } = this.props;
    let selectedAccount = accounts[0];

    if (accountId) {
      const account = accounts.find(i => i.id === accountId);
      if (account) {
        selectedAccount = account;
      }
    }

    this.setState({
      accounts,
      selected: selectedAccount
    });
  }

  setSelectedAccountFromProps() {
    const { formData: accountId } = this.props;
    const { accounts } = this.state;

    if (accountId && accounts) {
      const account = accounts.find(i => i.id === accountId);

      if (!account) {
        // TODO: Set a default that warns about "This map is associated to an unknown account"
      }

      if (account) {
        this.setState({ selected: account });
      }
    }
  }

  async loadAccountsWithAccountsQuery() {
    const { data: accounts = [], errors } = await AccountsQuery.query();
    this.handleLoadAccountsResponse({ accounts, errors });
  }

  select = account => {
    this.setState(state => {
      if (!state.selected || state.selected.id !== account.id) {
        return {
          selectedFromUrlState: false,
          selected: account
        };
      }

      return {};
    });
  };

  render() {
    const { className, style } = this.props;
    const { accounts, selected } = this.state;

    if (!accounts) {
      return <Spinner />;
    }

    const items = accounts.map(account => (
      <option
        key={account.id}
        onClick={() => this.select(account)}
        value={account.id}
      >
        {account.name}
      </option>
    ));
    const empty = <option>No accounts found...</option>;
    const accountItems = items.length > 0 ? items : empty;

    return (
      <>
        <select
          id="account-picker"
          value={selected ? selected.id : 'Choose an account'}
          onChange={event => {
            const value = event.target.value;
            const selected = accounts.find(a => a.id === parseInt(value, 10));
            this.setState({ selected });
          }}
          className={`Dropdown-trigger Dropdown-trigger--small u-unstyledButton Dropdown-trigger--normal ${className}`}
          style={style}
        >
          {accountItems}
        </select>
      </>
    );
  }
}
