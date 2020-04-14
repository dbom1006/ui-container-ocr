import { Col, Icon, Input, Row, Button, Popconfirm, Avatar, Tooltip, Tag } from 'antd';
import React, { Component } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import Link from 'umi/link';
import { connect } from 'dva';
import styles from './style.less';
import StandardTable from '@/components/StandardTable';
import moment from 'moment';
import { round2 } from '@/utils/utils';
import PopupAddSource from '@/pages/sources/components/PopupAddSource';
import { router } from 'umi';

@connect(({ sources, loading }) => ({
  data: sources.data,
  loading: loading.effects['sources/fetch'] || loading.effects['sources/runWorker'],
}))
class Sources extends Component {
  state = {
    selectedRows: [],
    showPopup: false,
    typePopup: 'Add',
    dataPopup: {},
  };

  componentDidMount() {
    this.fetchData();
  }

  handleSelectRows = selectedRows => {
    this.setState({ selectedRows });
  };

  handleTableChange = (pagination, filter, sort) => {
    const { dispatch } = this.props;
    const { data } = this.props;
    this.fetchData(pagination, filter, sort, data.search);
  };

  handleSearch = search => {
    const { data } = this.props;
    const { pagination, filter, sort } = data;
    this.fetchData(pagination, filter, sort, search);
  };

  handleSearchChange = e => {
    const { pagination, filter, sort, search } = this.props.data;
    if (!e.target.value && search) {
      this.fetchData(pagination, filter, sort, '');
    }
  };

  fetchData = (pagination, filter, { field = 'updatedAt', order = 'desc' } = {}, search) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'sources/fetch',
      payload: {
        pagination,
        filter,
        sort: { field, order },
        search,
      },
    });
  };

  showAddPopup = () => {
    this.setState({
      showPopup: true,
      typePopup: 'Add',
      dataPopup: undefined,
    });
  };

  showEditPopup = item => {
    this.setState({
      showPopup: true,
      typePopup: 'Edit',
      dataPopup: item,
    });
  };

  scanSource = source => {
    const { dispatch } = this.props;
    dispatch({
      type: 'sources/runWorker',
      payload: source._id,
      callback: () => {
        if(source.type !== "Image") {
          router.push('/sources/'+source._id+'/containers');
        } else {
          router.push('/containers');
        }        
      },
    });
  };

  columns = [
    {
      title: 'Image',
      dataIndex: '',
      render: ({ file, url, type }) => (
        <Avatar
          src={(file && file.url) || url}
          shape="square"
          size={80}
          icon={type == 'Image' ? 'file-image' : 'video-camera'}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Offline',
      dataIndex: 'isOffline',
      render: isOffline => isOffline && <Icon type="check" />,
    },
    {
      title: 'Type',
      dataIndex: 'type',
    },
    {
      title: 'State',
      dataIndex: 'state',
      render: (state = 'Pending') => {
        let color = 'gold';
        if (state == 'Processing') color = '#1890ff';
        if (state == 'Finished') color = '#52c41a';
        if (state == 'Failed') color = '#f5222d';
        return <Tag color={color}>{state}</Tag>;
      },
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      render: date => moment(date).format('HH:mm DD/MM/YYYY'),
      sorter: true,
    },
    {
      title: 'Actions',
      //dataIndex: 'id',
      render: (source) => (
        <span className={styles.actions}>
          <Link to={`/sources/${source._id}/detail`}>
            <Tooltip title="View detail">
              <Button type="link" shape="circle" icon="eye" />
            </Tooltip>
          </Link>
          {/* <Link to={`/sources/${id}/container`}> */}
          <Tooltip title="Run Worker to Scan">
            <Button type="link" shape="circle" icon="scan" onClick={() => this.scanSource(source)} />
          </Tooltip>
          {/* </Link> */}
        </span>
      ),
    },
  ];

  render() {
    const { data, loading } = this.props;
    const { selectedRows, showPopup, typePopup, dataPopup } = this.state;
    return (
      <PageHeaderWrapper title="Media Source - Camera">
        <PopupAddSource
          show={showPopup}
          type={typePopup}
          dataPopup={dataPopup}
          refreshList={this.fetchData}
          onClose={() => this.setState({ showPopup: false, dataPopup: null })}
        />
        <Row type="flex" justify="space-between" className={styles.header}>
          <Col md={6}>
            <Button type="primary" onClick={this.showAddPopup}>
              Add Source
            </Button>
          </Col>
          <Col md={6}>
            <Input.Search
              placeholder="Enter to search source"
              enterButton
              allowClear
              onChange={this.handleSearchChange}
              onSearch={this.handleSearch}
            />
          </Col>
        </Row>
        <StandardTable
          rowKey="id"
          // selectedRows={selectedRows}
          loading={loading}
          data={data}
          columns={this.columns}
          onSelectRow={this.handleSelectRows}
          onChange={this.handleTableChange}
          size="middle"
        />
      </PageHeaderWrapper>
    );
  }
}

export default Sources;
