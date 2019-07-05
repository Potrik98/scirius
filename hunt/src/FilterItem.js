import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { ListViewItem, ListViewInfoItem, ListViewIcon, Row } from 'patternfly-react';
import * as config from 'hunt_common/config/Api';
import FilterEditKebab from './components/FilterEditKebab';

export default class FilterItem extends React.Component {
    constructor(props) {
        super(props);
        // eslint-disable-next-line react/no-unused-state
        this.state = { data: undefined, loading: true };
    }

    componentDidMount() {
        this.fetchData(this.props.config, this.props.filters);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.from_date !== this.props.from_date) {
            this.fetchData(this.props.config, this.props.filters);
        }
    }

    // eslint-disable-next-line no-unused-vars
    fetchData(filtersStat, filters) {
        // eslint-disable-next-line react/no-unused-state
        this.setState({ loading: true });
        axios.get(`${config.API_URL + config.ES_BASE_PATH}poststats_summary/?value=rule_filter_${this.props.data.pk}&from_date=${this.props.from_date}`)
        .then((res) => {
            // eslint-disable-next-line react/no-unused-state
            this.setState({ data: res.data, loading: false });
        }).catch(() => {
            // eslint-disable-next-line react/no-unused-state
            this.setState({ loading: false });
        });
    }

    render() {
        const item = this.props.data;
        const addinfo = [];
        for (let i = 0; i < item.filter_defs.length; i += 1) {
            const info = <ListViewInfoItem key={`filter-${i}`}><p>{item.filter_defs[i].operator === 'different' && 'Not '}{item.filter_defs[i].key}: {item.filter_defs[i].value}</p></ListViewInfoItem>;
            addinfo.push(info);
        }
        if (Object.keys(this.props.rulesets).length > 0) {
            const rulesets = item.rulesets.map((item2) => (<ListViewInfoItem key={`${item2}-ruleset`}><p>Ruleset: {this.props.rulesets[item2].name}</p></ListViewInfoItem>));
            addinfo.push(rulesets);
        }
        let description = '';
        if (item.action !== 'suppress') {
            description = <ul className="list-inline">{Object.keys(item.options).map((option) => (<li key={option}><strong>{option}</strong>: {item.options[option]}</li>))}</ul>;
        }
        let icon;
        switch (item.action) {
            case 'suppress':
                icon = <ListViewIcon name="close" />;
                break;
            case 'threshold':
                icon = <ListViewIcon name="minus" />;
                break;
            case 'tag':
                icon = <ListViewIcon name="envelope" />;
                break;
            case 'tagkeep':
                icon = <ListViewIcon name="envelope" />;
                break;
            default:
                icon = <ListViewIcon name="envelope" />;
                break;
        }
        const actionsMenu = [<span key={`${item.pk}-index`} className="badge badge-default">{item.index}</span>];
        actionsMenu.push(<FilterEditKebab key={`${item.pk}-kebab`} data={item} updateIDSFilterState={this.props.updateIDSFilterState} last_index={this.props.last_index} needUpdate={this.props.needUpdate} switchPage={this.props.switchPage} />);
        return (
            <ListViewItem
                key={`${item.pk}-listitem`}
                leftContent={icon}
                additionalInfo={addinfo}
                heading={item.action}
                description={description}
                actions={actionsMenu}
            >
                {this.state.data && <Row>
                    {this.state.data.map((item2) => (
                        <div className="col-xs-3 col-sm-2 col-md-2" key={item2.key}>
                            <div className="card-pf card-pf-accented card-pf-aggregate-status">
                                <h2 className="card-pf-title">
                                    <span className="fa fa-shield" />{item2.key}
                                </h2>
                                <div className="card-pf-body">
                                    <p className="card-pf-aggregate-status-notifications">
                                        <span className="card-pf-aggregate-status-notification"><span className="pficon pficon-ok" />{item2.seen.value}</span>
                                        <span className="card-pf-aggregate-status-notification"><span className="pficon pficon-error-circle-o" />{item2.drop.value}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                    }
                </Row>}
            </ListViewItem>
        );
    }
}
FilterItem.propTypes = {
    config: PropTypes.any,
    data: PropTypes.any,
    filters: PropTypes.any,
    from_date: PropTypes.any,
    rulesets: PropTypes.any,
    needUpdate: PropTypes.any,
    last_index: PropTypes.any,
    updateIDSFilterState: PropTypes.any,
    switchPage: PropTypes.any
};
