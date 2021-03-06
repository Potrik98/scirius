/* eslint-disable react/no-this-in-sfc */
import React from 'react';
import { DropdownButton, MenuItem } from 'patternfly-react';
import axios from 'axios';
import * as config from 'hunt_common/config/Api';
import { buildQFilter } from 'hunt_common/buildQFilter';

export function actionsButtons() {
    if (process.env.REACT_APP_HAS_ACTION === '1' || process.env.NODE_ENV === 'development') {
        if (this.state.supported_actions.length === 0) {
            return (
                <div className="form-group">
                    <DropdownButton bsStyle="default" title="Actions" key="actions" id="dropdown-basic-actions" disabled />
                </div>
            );
        }
        const actions = [];
        let eventKey = 1;
        for (let i = 0; i < this.state.supported_actions.length; i += 1) {
            const action = this.state.supported_actions[i];
            if (action[0] === '-') {
                actions.push(<MenuItem key={`divider${i}`} divider />);
            } else {
                actions.push(
                    <MenuItem
                        key={action[0]}
                        eventKey={eventKey}
                        onClick={() => {
                            this.createAction(action[0]);
                        }}
                    >{action[1]}
                    </MenuItem>);
                eventKey += 1;
            }
        }
        return (
            <div className="form-group">
                <DropdownButton bsStyle="default" title="Actions" key="actions" id="dropdown-basic-actions">
                    {actions}
                </DropdownButton>
            </div>
        );
    }
    return null;
}

export function buildListUrlParams(pageParams) {
    const { page, perPage } = pageParams.pagination;
    const { sort } = pageParams;
    let ordering = '';


    if (sort.asc) {
        ordering = sort.id;
    } else {
        ordering = `-${sort.id}`;
    }

    return `ordering=${ordering}&page_size=${perPage}&page=${page}`;
}

export function loadActions(filtersIn) {
    let { filters } = this.props;
    if (typeof filtersIn !== 'undefined') {
        filters = filtersIn;
    }
    filters = filters.map((f) => f.id);
    const reqData = { fields: filters };
    axios.post(`${config.API_URL}${config.PROCESSING_PATH}test_actions/`, reqData).then(
        (res) => {
            this.setState({ supported_actions: res.data.actions });
        });
}

export function createAction(type) {
    this.setState({ action: { view: true, type } });
}

export function UpdateFilter(filters, page = 1) {
    const newListState = Object.assign({}, this.props.rules_list);
    newListState.pagination.page = page;
    this.props.updateFilterState(filters);
    this.updateRuleListState(newListState);
    this.fetchData(newListState, filters);
    if (this.props.needReload) {
        this.props.needReload();
    }
    this.loadActions(filters);
}

export function addFilter(field, value, negated) {
    if (field !== 'alert.tag') {
        let filterText = '';
        filterText = field;
        filterText += ': ';
        filterText += value;
        const activeFilters = [...this.props.filters, {
            label: filterText, id: field, value, negated, fullString: true
        }];
        this.UpdateFilter(activeFilters);
    } else {
        let tfilters = {};
        if (negated) {
            tfilters = { untagged: true, informational: true, relevant: true };
            tfilters[value] = false;
        } else {
            tfilters = { untagged: false, informational: false, relevant: false };
            tfilters[value] = true;
        }
        this.updateAlertTag(tfilters);
    }
}

export function handlePaginationChange(pagin) {
    const lastPage = Math.ceil(this.state.count / pagin.perPage);
    if (pagin.page > lastPage) {
        pagin.page = lastPage;
    }

    const newListState = Object.assign({}, this.props.rules_list);
    newListState.pagination = pagin;
    this.updateRuleListState(newListState);
    this.fetchData(newListState, this.props.filters);
}

export function onFirstPage() {
    const newListState = Object.assign({}, this.props.rules_list);
    newListState.pagination.page = 1;
    this.updateRuleListState(newListState);
    this.fetchData(newListState, this.props.filters);
}

export function onNextPage() {
    const newListState = Object.assign({}, this.props.rules_list);
    newListState.pagination.page += 1;
    this.updateRuleListState(newListState);
    this.fetchData(newListState, this.props.filters);
}

export function onPrevPage() {
    const newListState = Object.assign({}, this.props.rules_list);
    newListState.pagination.page -= 1;
    this.updateRuleListState(newListState);
    this.fetchData(newListState, this.props.filters);
}

export function onLastPage() {
    const newListState = Object.assign({}, this.props.rules_list);
    newListState.pagination.page = Math.ceil(this.state.count / this.props.rules_list.pagination.perPage);
    this.updateRuleListState(newListState);
    this.fetchData(newListState, this.props.filters);
}

export function setViewType(type) {
    const newListState = Object.assign({}, this.props.rules_list);
    newListState.view_type = type;
    this.updateRuleListState(newListState);
}

export function UpdateSort(sort) {
    const newListState = Object.assign({}, this.props.rules_list);
    newListState.sort = sort;
    this.updateRuleListState(newListState);
    this.fetchData(newListState, this.props.filters);
}

export function closeAction() {
    this.setState({ action: { view: false, type: null } });
}

export function updateAlertTag(tfilters) {
    /* Update the filters on alert.tag and send the update */
    const activeFilters = Object.assign([], this.props.filters);
    const tagFilters = { id: 'alert.tag', value: tfilters };
    if (activeFilters.length === 0) {
        activeFilters.push(tagFilters);
    } else {
        let updated = false;
        for (let i = 0; i < activeFilters.length; i += 1) {
            if (activeFilters[i].id === 'alert.tag') {
                activeFilters[i] = tagFilters;
                updated = true;
                break;
            }
        }
        if (updated === false) {
            activeFilters.push(tagFilters);
        }
    }
    this.UpdateFilter(activeFilters);
}

export function buildFilter(filters) {
    const lFilters = {};
    for (let i = 0; i < filters.length; i += 1) {
        if (filters[i].id !== 'probe' && filters[i].id !== 'alert.tag') {
            if (filters[i].id in lFilters) {
                lFilters[filters[i].id] += `,${filters[i].value}`;
            } else {
                lFilters[filters[i].id] = filters[i].value;
            }
        }
    }
    let stringFilters = '';
    const objKeys = Object.keys(lFilters);
    for (let k = 0; k < objKeys.length; k += 1) {
        stringFilters += `&${objKeys[k]}=${lFilters[objKeys[k]]}`;
    }
    const qfilter = buildQFilter(filters, this.props.systemSettings);
    if (qfilter) {
        stringFilters += qfilter;
    }
    return stringFilters;
}
