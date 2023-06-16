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
  DatePicker,
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

@connect(({ containers, user, loading }) => ({
  data: containers.data,
  loading: loading.effects['containers/fetch'],
}))
class ListTimekeeping extends Component {
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

  disabledDate(current) {
    return current && current > moment().endOf('day');
  }

  columns = [
    {
      title: 'Nhân viên',
      dataIndex: '',
      render: data => {
        const { employee } = data?.attributes;
        const { firstName = '', lastName = '', avatar = {}, code } = employee?.data?.attributes;
        const avatarUrl = avatar?.data?.attributes?.url;
        const fullName = displayFullName(firstName, lastName);

        return (
          <Row type="flex" align="middle" className={styles.staffInfo}>
            <Avatar size={40} className={styles.avatar} src={avatarUrl} alt="avatar">
              {fullName}
            </Avatar>
            <div className={styles.right}>
              <h4>{fullName}</h4>
              <p>{code}</p>
            </div>
          </Row>
        );
      },
    },
    {
      title: 'Hình ảnh',
      dataIndex: '',
      render: data => {
        const { image } = data?.attributes;
        return (
          <img
            className={styles.image}
            height={60}
            src={API_URL + image?.data?.attributes?.url}
            // onClick={() => this.handlePreview(image?.data?.attribute?.url, codeNumber)}
          />
        );
      },
    },
    {
      title: 'Thời gian nhận diện',
      dataIndex: '',
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
      title: 'Vị trí - Nguồn',
      dataIndex: '',
      render: data => {
        const { source = {} } = data?.attributes;
        const { name, position } = source?.data?.attributes;
        return [position, name].filter(Boolean).join(' - ');
      },
    },
    {
      title: 'Active',
      render: data => {
        const { active } = data?.attributes;
        return <Switch defaultChecked={active} />;
      },
    },
    {
      title: 'Hành động',
      dataIndex: '',
      render: data => {
        const { source = {} } = data?.attributes;
        const { id: sourceId } = source?.data;
        return (
          <span className={styles.actions}>
            <Link to={`/containers/${data?.id}`}>
              <Tooltip title="View detail">
                <Button type="link" shape="circle" icon="eye" />
              </Tooltip>
            </Link>
            <Link to={`/sources/${sourceId}/detail`}>
              <Tooltip title="View source">
                <Button type="link" shape="circle" icon="link" />
              </Tooltip>
            </Link>
          </span>
        );
      },
    },
  ];

  render() {
    const { data, loading } = this.props;
    const { selectedRows, previewVisible, previewImage, previewNumber, previewVideo } = this.state;
    return (
      <PageHeaderWrapper title="Chấm công">
        <Row type="flex" justify="space-between" className={styles.header}>
          <Button disabled={!selectedRows.length} type="primary">
            Xuất ra file CSV
          </Button>
          <DatePicker
            defaultValue={moment()}
            format="DD-MM-YYYY"
            disabledDate={this.disabledDate}
          />
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

export default ListTimekeeping;
