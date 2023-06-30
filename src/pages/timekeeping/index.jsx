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

@connect(({ timekeepings, user, loading }) => ({
  data: timekeepings.data,
  loading: loading.effects['timekeepings/fetch'],
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

  fetchData = (date = moment()) => {
    const { dispatch, customer } = this.props;
    dispatch({
      type: 'timekeepings/fetch',
      payload: {
        date: moment(date).format('YYYY-MM-DD'),
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
      dataIndex: 'employee',
      render: employee => {
        const { firstName = '', lastName = '', avatar = {}, code } = employee;
        const avatarUrl = API_URL + avatar?.url;
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
      title: 'Khoa',
      dataIndex: 'employee[team]',
    },
    {
      title: 'Thời gian nhận diện',
      dataIndex: 'checkin',
      render: checkin => {
        if (!checkin) return '-';

        const { date, time } = checkin;
        return <b>{moment(time, 'HH:mm').format('HH:mm')}</b>;
      },
    },
    {
      title: 'Ảnh checkin',
      dataIndex: 'checkin',
      render: checkin => {
        if (!checkin) return '-';

        const { image } = checkin;
        const imageUrl = API_URL + image?.url;
        return (
          <img
            className={styles.image}
            height={60}
            src={imageUrl}
            // onClick={() => this.handlePreview(image?.data?.attribute?.url, codeNumber)}
          />
        );
      },
    },
    // {
    //   title: 'Vị trí - Nguồn',
    //   dataIndex: '',
    //   render: data => {
    //     const { source = {} } = data?.attributes;
    //     const { name, position } = source?.data?.attributes;
    //     return [position, name].filter(Boolean).join(' - ');
    //   },
    // },
    // {
    //   title: 'Active',
    //   render: data => {
    //     const { active } = data?.attributes;
    //     return <Switch defaultChecked={active} />;
    //   },
    // },
  ];

  render() {
    const { data, loading } = this.props;
    const { selectedRows, previewVisible, previewImage, previewNumber, previewVideo } = this.state;
    return (
      <PageHeaderWrapper title="Danh sách chấm công">
        <Row type="flex" justify="space-between" className={styles.header}>
          <Button disabled={!selectedRows.length} type="primary">
            Xuất ra file CSV
          </Button>
          <DatePicker
            defaultValue={moment()}
            format="DD-MM-YYYY"
            disabledDate={this.disabledDate}
            onChange={date => this.fetchData(date)}
            allowClear={false}
            size="large"
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
