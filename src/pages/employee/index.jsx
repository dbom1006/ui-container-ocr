import { Col, Icon, Input, Row, Button, Popconfirm, Avatar, Tooltip, Tag, message } from 'antd';
import React, { Component } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import Link from 'umi/link';
import { connect } from 'dva';
import styles from './style.less';
import StandardTable from '@/components/StandardTable';
import moment from 'moment';
import { displayFullName, round2 } from '@/utils/utils';
import PopupAddEmployee from '@/pages/employee/components/PopupAddEmployee';
import { router } from 'umi';
import { API_URL, SOURCE_STATES } from '@/utils/constants';
import { runTrainingEmployees } from '@/services/employee';

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
    syncLoading: false
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
    this.setState({ syncLoading: true })
    try{
      const result = await runTrainingEmployees();
      if(result.data?.success) message.success("Đồng bộ thành công!")
      else message.success("Đồng bộ thất bại, vui lòng thử lại!")
    }catch(e){
      message.success("Đồng bộ thất bại, vui lòng thử lại!")
    }
    this.setState({ syncLoading: false })
  }

  showEditPopup = item => {
    this.setState({
      showPopup: true,
      typePopup: 'Edit',
      dataPopup: item,
    });
  };

  columns = [
    {
      title: 'Mã NV',
      dataIndex: 'attributes[code]',
    },
    {
      title: 'Avatar',
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
      title: 'Team',
      dataIndex: 'attributes[team]',
    },
    {
      title: 'Ảnh nhận diện',
      dataIndex: 'attributes[images][data]',
      render: images => (
        <div className={styles.listImages}>
          {images?.map(x => (
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
          onClose={() => this.setState({ showPopup: false, dataPopup: null })}
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

export default ListEmployee;