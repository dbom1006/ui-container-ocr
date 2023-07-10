import StandardTable from '@/components/StandardTable';
import PopupAddEmployee from '@/pages/employee/components/PopupAddEmployee';
import { runTrainingEmployees } from '@/services/employee';
import { API_URL } from '@/utils/constants';
import { displayFullName } from '@/utils/utils';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { Avatar, Button, Col, Input, Row, Switch, message } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import React, { Component } from 'react';
import styles from './style.less';

@connect(({ employees, loading }) => ({
  data: employees.data,
  loading: loading.effects['employees/fetch'],
}))
class ListEmployee extends Component {
  state = {
    selectedRows: [],
    showPopup: false,
    typePopup: 'Add',
    dataPopup: {},
    syncLoading: false,
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

  fetchData = (pagination, filter, { field = 'createdAt', order = 'desc' } = {}, search) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'employees/fetch',
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

  runTraining = async () => {
    this.setState({ syncLoading: true });
    try {
      const result = await runTrainingEmployees();
      if (result.data?.success) message.success('Đồng bộ thành công!');
      else message.success('Đồng bộ thất bại, vui lòng thử lại!');
    } catch (e) {
      message.success('Đồng bộ thất bại, vui lòng thử lại!');
    }
    this.setState({ syncLoading: false });
  };

  showEditPopup = (employeeId, item) => {
    this.setState({
      showPopup: true,
      typePopup: 'Edit',
      dataPopup: { ...item, employeeId },
    });
  };

  handleUpdateEmployee = (employeeId, data = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'employees/update',
      employeeId,
      payload: data,
      callback: () => message.success('Cập nhật thành công!'),
    });
  };

  columns = [
    {
      title: 'Mã NV',
      dataIndex: 'attributes[code]',
    },
    {
      title: 'Ảnh đại diện',
      dataIndex: '',
      render: data => {
        const { firstName = '', avatar = {} } = data?.attributes;
        const avatarUrl = API_URL + avatar?.data?.attributes?.url;
        return (
          <Avatar size={50} className={styles.avatar} src={avatarUrl} alt="avatar">
            {firstName}
          </Avatar>
        );
      },
    },
    {
      title: 'Tên',
      dataIndex: '',
      render: data => {
        const { firstName = '', lastName = '' } = data?.attributes;
        return displayFullName(firstName, lastName);
      },
    },
    {
      title: 'Phòng/Ban',
      dataIndex: 'attributes[team]',
    },
    {
      title: 'Ảnh nhận diện',
      width: 200,
      dataIndex: 'attributes[images][data]',
      render: images => (
        <div className={styles.listImages}>
          {images?.slice(0, 4).map(x => (
            <img key={x?.attributes?.id} src={API_URL + x?.attributes?.url} />
          ))}
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'attributes[createdAt]',
      render: createdAt => {
        return moment(createdAt).format('DD/MM/YYYY');
      },
    },
    {
      title: 'Trạng thái',
      width: 90,
      dataIndex: '',
      render: data => {
        const { id, attributes = {} } = data || {};
        const { active } = attributes;
        return (
          <Switch
            defaultChecked={active}
            onChange={checked => this.handleUpdateEmployee(id, { active: checked })}
          />
        );
      },
    },
    {
      title: 'Hành động',
      dataIndex: '',
      align: 'center',
      render: data => {
        const { id, attributes = {} } = data || {};
        const { active } = attributes;
        return (
          <Button type="link" icon="edit" onClick={() => this.showEditPopup(id, attributes)} />
        );
      },
    },
  ];

  render() {
    const { data, loading } = this.props;
    const { selectedRows, showPopup, typePopup, dataPopup, syncLoading } = this.state;
    return (
      <PageHeaderWrapper title="Danh sách nhân viên">
        <PopupAddEmployee
          show={showPopup}
          type={typePopup}
          dataPopup={dataPopup}
          refreshList={this.fetchData}
          onClose={() => this.setState({ showPopup: false, dataPopup: {} })}
        />
        <Row type="flex" justify="space-between" className={styles.header}>
          <Col md={12}>
            <Button type="primary" onClick={this.showAddPopup}>
              Thêm mới nhân viên
            </Button>
            <Button type="primary" loading={syncLoading} ghost onClick={this.runTraining}>
              Đồng bộ hệ thống nhận diện
            </Button>
          </Col>

          <Col md={6}>
            <Input.Search
              placeholder="Tìm kiếm thông tin nhân viên"
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

export default ListEmployee;
