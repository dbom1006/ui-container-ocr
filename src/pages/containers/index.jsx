import { Col, Icon, Input, Row, Button, Popconfirm, message, Avatar, Tooltip, Modal } from 'antd';
import React, { Component } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import Link from 'umi/link';
import { connect } from 'dva';
import styles from './style.less';
import StandardTable from '@/components/StandardTable';
import moment from 'moment';
import { round2 } from '@/utils/utils';

@connect(({ containers, user, loading }) => ({
  data: containers.data,
  loading: loading.effects['containers/fetch'],
}))
class ListContainers extends Component {
  state = {
    selectedRows: [],
    previewVisible: false,
    previewImage: null,
    previewVideo: false,
    previewNumber: '',
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
    const { dispatch, customer } = this.props;
    dispatch({
      type: 'containers/fetch',
      payload: {
        pagination,
        filter,
        sort: { field, order },
        search,
      },
    });
  };
  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = async (url, codeNumber, isVideo) => {
    this.setState({
      previewImage: url,
      previewVideo: isVideo,
      previewNumber: codeNumber,
      previewVisible: true,
    });
  };

  columns = [
    {
      title: 'Hình ảnh',
      dataIndex: '',
      render: ({ image, url, source, codeNumber }) => {
        image = (url ? { url } : null) || image || source;
        return (
          <img
            className={styles.image}
            height={60}
            src={image.url}
            onClick={() => this.handlePreview(image.url, codeNumber)}
          />
        );
      },
    },
    {
      title: 'Mã Container',
      dataIndex: 'codeNumber',
      render: code => <b>{code}</b>,
    },
    {
      title: 'Thời gian nhận diện',
      dataIndex: 'updatedAt',
      render: date => moment(date).format('HH:mm DD/MM/YYYY'),
      sorter: true,
    },
    {
      title: 'Vị trí - Nguồn',
      dataIndex: 'source',
      render: source => [source.position,source.name].filter(Boolean).join(','),
    },
    {
      title: 'Hành động',
      dataIndex: '',
      render: container => (
        <span className={styles.actions}>
          <Link to={`/containers/${container.id}`}>
            <Tooltip title="View detail">
              <Button type="link" shape="circle" icon="eye" />
            </Tooltip>
          </Link>
          <Link to={`/sources/${container.source.id}/detail`}>
            <Tooltip title="View source">
              <Button type="link" shape="circle" icon="link" />
            </Tooltip>
          </Link>
        </span>
      ),
    },
  ];

  render() {
    const { data, loading } = this.props;
    const { selectedRows, previewVisible, previewImage, previewNumber, previewVideo } = this.state;
    return (
      <PageHeaderWrapper title="Danh sách Container">
        <Row type="flex" justify="space-between" className={styles.header}>
          <Col md={6}>
            <Button disabled={!selectedRows.length} type="primary">
              Xuất ra file CSV
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
          selectedRows={selectedRows}
          onSelectRow={this.handleSelectRows}
          loading={loading}
          data={data}
          columns={this.columns}
          onChange={this.handleTableChange}
        />
        <Modal
          width={680}
          visible={previewVisible}
          destroyOnClose
          footer={null}
          onCancel={this.handleCancel}
        >
          <h2>{previewNumber}</h2>
          {previewVideo ? (
            <video style={{ width: '100%' }} controls>
              <source src={previewImage}></source>
            </video>
          ) : (
            <img alt="preview" style={{ width: '100%' }} src={previewImage} />
          )}
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default ListContainers;
