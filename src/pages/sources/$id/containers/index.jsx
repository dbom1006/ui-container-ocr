import { Avatar, Card, Col, Icon, Input, Row, Button, Table, Tooltip, message } from 'antd';
import React, { PureComponent } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import Link from 'umi/link';
import { connect } from 'dva';
import upperFirst from 'lodash/upperFirst';
import styles from './style.less';
import StandardTable from '@/components/StandardTable';

const isHired = state => ['CONFIRMED', 'WORKING', 'SEND_FUND', 'SEND_FUND_FAILED'].includes(state);
const isCheckin = state => ['WORKING', 'SEND_FUND', 'SEND_FUND_FAILED'].includes(state);

@connect(({ sourceDetail, settings, user, loading }) => ({
  containers: sourceDetail.containers,
  event: sourceDetail.current,
  customer: user.currentUser,
  positions: settings.positions,
  loading: loading.effects['sourceDetail/fetchContainers'] || loading.effects['sourceDetail/addToRoster'],
}))
class SourceContainers extends PureComponent {
  state = {
    selectedRows: [],
  };

  componentDidMount() {
    this.fetchData();
  }

  handleSelectRows = selectedRows => {
    this.setState({ selectedRows });
  };

  handleTableChange = (pagination, filter, sort) => {
    const { dispatch } = this.props;
    const { containers } = this.props;
    this.fetchData(pagination, filter, sort, containers.search);
  };

  handleSearch = search => {
    const { containers } = this.props;
    const { pagination, filter, sort } = containers;
    this.fetchData(pagination, filter, sort, search);
  };

  handleSearchChange = e => {
    const { pagination, filter, sort, search } = this.props.containers;
    if (!e.target.value && search) {
      this.fetchData(pagination, filter, sort, '');
    }
  };

  fetchData = (pagination = {}, filter = {}, sort = {}, search = '') => {
    const { dispatch, event } = this.props;
    dispatch({
      type: 'sourceDetail/fetchContainers',
      payload: {
        pagination,
        filter: {
          jobEvent: event.id,
          company: event.host._id,
          state: ['CONFIRMED', 'WORKING', 'SEND_FUND', 'SEND_FUND_FAILED'],
          ...filter,
        },
        sort,
        search,
      },
    });
  };

  addToRoster = (user = {}, state = 'ROSTER') => {
    const { customer, dispatch } = this.props;
    const company = customer.company || null;
    dispatch({
      type: 'sourceDetail/addToRoster',
      payload: { user, company, state },
      callback: () => {
        const { pagination, filter, sort, search } = this.props.containers;
        this.fetchData(pagination, filter, sort, search);
        message.success('Success');
      },
    });
  };

  columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (name, { user }) => (
        <Row type="flex" gutter={12} align="middle" className={styles.info}>
          <Col>
            <Avatar shape="circle" src={user && user.avatar}>
              {(name && name[0]) || (user.name && user.name[0])}
            </Avatar>
          </Col>
          <Col className={styles.infoLimit}>
            <div title={name || (user && user.name)}>
              <b>{name || (user && user.name)}</b>
            </div>
            <div title={user && user.email}>{user && user.email}</div>
          </Col>
        </Row>
      ),
    },
    {
      title: 'Position',
      dataIndex: 'job.position',
      render: id => {
        if (!id) {
          const { containers } = this.props;
          const { filter } = containers;
          if (filter['job.position']) id = filter['job.position'];
        }
        const { positions } = this.props;
        const position = positions.find(x => x.id == id);
        return position ? position.name : '';
      },
      filters: this.props.positions.map(x => ({ text: x.name, value: x.id })),
      filterMultiple: false,
    },
    {
      title: 'On Roster',
      dataIndex: 'status',
      render: status => (
          <Button
            type="primary"
            size="small"
            disabled={status != 'ROSTER'}
            icon="check"
            shape="circle"
          />
        ),
    },
    {
      title: 'Blocked',
      dataIndex: '',
      render: container => (
          <Button
            type="primary"
            size="small"
            disabled={container.status != 'BLOCK'}
            icon="check"
            shape="circle"
          />
        ),
    },
    {
      title: 'Actions',
      dataIndex: '',
      render: container => {
        if (container && container.status) {
          switch (container.status) {
            case 'ROSTER':
              return (
                <div className={styles.actions}>
                  <Tooltip placement="topLeft" title="Block" arrowPointAtCenter>
                    <Button shape="circle" onClick={() => this.addToRoster(container.user, 'BLOCK')}>
                      <Icon type="stop" />
                    </Button>
                  </Tooltip>
                </div>
              );
            case 'BLOCK':
              return (
                <div className={styles.actions}>
                  <Tooltip placement="topLeft" title="Add to Roster" arrowPointAtCenter>
                    <Button shape="circle" onClick={() => this.addToRoster(container.user)}>
                      <Icon type="user-add" />
                    </Button>
                  </Tooltip>
                </div>
              );
            default:
              return (
                <div className={styles.actions}>
                  <Tooltip placement="topLeft" title="Add to Roster" arrowPointAtCenter>
                    <Button shape="circle" onClick={() => this.addToRoster(container.user)}>
                      <Icon type="user-add" />
                    </Button>
                  </Tooltip>
                  <Tooltip placement="topLeft" title="Block" arrowPointAtCenter>
                    <Button shape="circle" onClick={() => this.addToRoster(container.user, 'BLOCK')}>
                      <Icon type="stop" />
                    </Button>
                  </Tooltip>
                </div>
              );
          }
        }
      },
    },
  ];

  positionColumn = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Required',
      dataIndex: 'required',
    },
    {
      title: 'Applied',
      dataIndex: 'applied',
    },
    {
      title: 'Hired',
      dataIndex: 'hired',
    },
    {
      title: 'Checkin',
      dataIndex: 'checkin',
    },
  ];

  getPositions = () => {
    const { event } = this.props;
    const { jobs } = event;
    return jobs.map(x => ({
      id: x.position.id,
      name: x.position.name,
      required: x.quantity,
      applied: x.containers.length,
      hired: x.containers.filter(y => isHired(y.state)).length,
      checkin: x.containers.filter(y => isCheckin(y.state)).length,
    }));
  };

  render() {
    const { containers, loading } = this.props;
    const { selectedRows } = this.state;
    return (
      <GridContent>
        <div className={styles.containers}>
          <Row type="flex" justify="end" className={styles.header}>
            <Col md={6}>
              <Input.Search
                placeholder="Enter to search container"
                enterButton
                allowClear
                onChange={this.handleSearchChange}
                onSearch={this.handleSearch}
              />
            </Col>
          </Row>
          <Row>
            <StandardTable
              // selectedRows={selectedRows}
              // onSelectRow={this.handleSelectRows}
              rowKey="id"
              loading={loading}
              data={containers}
              columns={this.columns}
              onChange={this.handleTableChange}
            />
          </Row>
          <Row style={{ textAlign: 'center' }}>
            For questions about the hours of a tender please email{' '}
            <a href="mailto:concierge@hiretend.com">concierge@hiretend.com</a>
          </Row>
        </div>
      </GridContent>
    );
  }
}

export default SourceContainers;
