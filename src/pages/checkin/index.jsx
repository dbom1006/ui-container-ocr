import {
  Col,
  Icon,
  Input,
  Row,
  Button,
  Popconfirm,
  message,
  Avatar,
  Tooltip,
  Modal,
  Switch,
  Tag,
} from 'antd';
import React, { Component } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import Link from 'umi/link';
import { connect } from 'dva';
import styles from './style.less';
import StandardTable from '@/components/StandardTable';
import moment from 'moment';
import { displayFullName, round2 } from '@/utils/utils';
import { API_URL } from '@/utils/constants';

@connect(({ checkins, user, loading }) => ({
  data: checkins.data,
  loading: loading.effects['checkins/fetch'],
}))
class ListCheckin extends Component {
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
      type: 'checkins/fetch',
      payload: {
        pagination,
        filter: { ...filter, populate: '*' },
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
      render: data => {
        const { image } = data?.attributes;
        const imageUrl = API_URL + image?.data?.attributes?.url;
        return (
          <img
            className={styles.image}
            height={60}
            src={imageUrl}
            onClick={() => this.handlePreview(imageUrl)}
          />
        );
      },
    },
    {
      title: 'Mã Container',
      dataIndex: '',
      render: data => <b>{data?.attributes?.code || '-'}</b>,
    },
    {
      title: 'Thời gian nhận diện',
      dataIndex: '',
      width: 200,
      render: data => {
        const { date, time } = data?.attributes;
        return (
          <>
            <b>{moment(time, 'HH:mm').format('HH:mm')}</b>{' '}
            <span>{moment(date).format('DD/MM/YYYY')}</span>
          </>
        );
      },
      // sorter: true,
    },
    {
      title: 'Camera',
      dataIndex: '',
      render: record => {
        const { source = {}, data } = record?.attributes;
        const sourceId = source?.data?.id || data?.source;
        const { name, position } = source?.data?.attributes || {};
        return [position, name].filter(Boolean).map(x => <div>{x}</div>);
      },
    },
    {
      title: 'Trạng thái',
      render: data => {
        const { status } = data?.attributes;
        return <Tag color={status == 'Thành công' ? '#52c41a' : '#f5222d'}>{status}</Tag>;
      },
    },
    {
      title: 'Hành động',
      dataIndex: '',
      align: 'center',
      render: record => {
        const { source = {}, data } = record?.attributes;
        const sourceId = source?.data?.id || data?.source;
        return (
          <Link to={`/sources/${sourceId}/detail`}>
            <Tooltip title="Xem camera">
              <Button type="link" shape="circle" icon="link" />
            </Tooltip>
          </Link>
        );
      },
    },
  ];

  render() {
    const { data, loading } = this.props;
    const { selectedRows, previewVisible, previewImage, previewNumber, previewVideo } = this.state;
    return (
      <PageHeaderWrapper title="Danh sách nhận diện Container">
        <Row type="flex" justify="space-between" className={styles.header}>
          <Col md={6}>
            <Button disabled={!selectedRows.length} type="primary">
              Xuất ra file CSV
            </Button>
          </Col>
          <Col md={6}>
            <Input.Search
              placeholder="Tìm kiếm thông tin checkin"
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
          width={480}
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

export default ListCheckin;
