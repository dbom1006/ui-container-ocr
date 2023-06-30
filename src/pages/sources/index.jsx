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
import { SOURCE_STATES } from '@/utils/constants';

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
        filter: { ...filter, populate: '*' },
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

  scanSource = (source, id) => {
    const { dispatch } = this.props;
    if (source.type == 'Image') {
      dispatch({
        type: 'sources/runWorker',
        payload: id,
        data: source.url,
        callback: () => {
          router.push('/checkins');
        },
      });
    } else {
      router.push('/sources/' + id + '/checkin');
    }
  };

  columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'attributes',
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
      title: 'Tên',
      dataIndex: 'attributes[name]',
    },
    // {
    //   title: 'Offline',
    //   dataIndex: 'isOffline',
    //   render: isOffline => isOffline && <Icon type="check" />,
    // },
    {
      title: 'Vị trí',
      dataIndex: 'attributes[position]',
    },
    {
      title: 'Loại',
      dataIndex: 'attributes[type]',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'attributes[state]',
      render: (state = 'Pending') => {
        return <Tag color={SOURCE_STATES[state].color}>{SOURCE_STATES[state].label}</Tag>;
      },
    },
    // {
    //   title: 'Updated At',
    //   dataIndex: 'updatedAt',
    //   render: date => moment(date).format('HH:mm DD/MM/YYYY'),
    //   sorter: true,
    // },
    {
      title: 'Hành động',
      //dataIndex: 'id',
      render: source => (
        <span className={styles.actions}>
          <Link to={`/sources/${source.id}/detail`}>
            <Tooltip title="View detail">
              <Button type="link" shape="circle" icon="eye" />
            </Tooltip>
          </Link>
          {/* <Link to={`/sources/${id}/container`}> */}
          <Tooltip title="Run Worker to Scan">
            <Button
              type="link"
              shape="circle"
              icon="scan"
              onClick={() => this.scanSource(source, source?.id)}
            />
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
      <PageHeaderWrapper title="Danh sách máy checkin">
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
              Thêm máy
            </Button>
          </Col>
          <Col md={6}>
            <Input.Search placeholder="Tìm kiếm..." enterButton allowClear />
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
