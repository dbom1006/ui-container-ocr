import { Avatar, Card, Col, Icon, Input, Row, Button, Table, Tooltip, message, Modal } from 'antd';
import React, { PureComponent } from 'react';
import { GridContent, PageHeaderWrapper } from '@ant-design/pro-layout';
import Link from 'umi/link';
import { connect } from 'dva';
import upperFirst from 'lodash/upperFirst';
import styles from './style.less';
import StandardTable from '@/components/StandardTable';
import moment from 'moment';

// const isHired = state => ['CONFIRMED', 'WORKING', 'SEND_FUND', 'SEND_FUND_FAILED'].includes(state);
// const isCheckin = state => ['WORKING', 'SEND_FUND', 'SEND_FUND_FAILED'].includes(state);

@connect(({ sourceDetail, loading }) => ({
  source: sourceDetail.current,
  data: sourceDetail.dataContainer,
  loading: loading.effects['sourceDetail/fetchDataContainer'],
}))
class SourceContainers extends PureComponent {
  state = {
    selectedRows: [],
    previewVisible: false,
    previewImage: null,
    previewVideo: false,
    previewNumber: '',
  };

  async componentDidMount() {
    setInterval(()=>{
      this.fetchData();
    },5000)
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
    const { dispatch, source } = this.props;
    dispatch({
      type: 'sourceDetail/fetchDataContainer',
      payload: {
        pagination,
        filter: { ...filter, source: source._id},
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
      title: 'Container Image',
      dataIndex: '',
      render: ({ image, source, codeNumber }) => {
        image = image || source;
        if (source.type == 'Video')
          return (
            <Avatar
              src={image.url}
              shape="square"
              size={80}
              icon="video-camera"
              onClick={() => this.handlePreview(image.url, codeNumber, 'Video')}
            />
          );
        return (
          <img
            className={styles.image}
            height={80}
            src={image.url}
            onClick={() => this.handlePreview(image.url, codeNumber)}
          />
        );
      },
    },
    {
      title: 'Code Number',
      dataIndex: 'codeNumber',
    },
    // {
    //   title: 'Confirmed',
    //   dataIndex: 'isConfirmed',
    //   render: isConfirmed => isConfirmed && <Icon type="check" />,
    // },
    // {
    //   title: 'Owner',
    //   dataIndex: 'owner',
    // },
    // {
    //   title: 'Seri',
    //   dataIndex: 'serial',
    // },
    // {
    //   title: 'Type',
    //   dataIndex: 'type',
    // },
    // {
    //   title: 'Time',
    //   dataIndex: 'updatedAt',
    //   render: date => moment(date).format('HH:mm DD/MM/YYYY'),
    //   sorter: true,
    // },
    // {
    //   title: 'Actions',
    //   dataIndex: '',
    //   render: container => (
    //     <span className={styles.actions}>
    //       <Link to={`/containers/${container.id}`}>
    //         <Tooltip title="View detail">
    //           <Button type="link" shape="circle" icon="eye" />
    //         </Tooltip>
    //       </Link>
    //       <Link to={`/sources/${container.source.id}/detail`}>
    //         <Tooltip title="View source">
    //           <Button type="link" shape="circle" icon="link" />
    //         </Tooltip>
    //       </Link>
    //     </span>
    //   ),
    // },
  ];

  render() {
    const { data, source } = this.props;
    const { selectedRows, previewVisible, previewImage, previewNumber, previewVideo } = this.state;
    return (
      <GridContent>
        <Row type="flex" justify="space-between" className={styles.header}>
          <Col md={6}>
            <Button disabled={!selectedRows.length} type="primary">
              Export CSV
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
        <Row gutter={24} className={styles.content}>
          <Col md={8} className={styles.preview}>
            {source.type !== 'Video' ? (
              <img src={(source.file && source.file.url) || source.url} />
            ) : (
              <video controls>
                <source
                  src={(source.file && source.file.url) || source.url}
                  type={source.file && source.file.mime}
                ></source>
              </video>
            )}
          </Col>
          <Col md={16}>
            <StandardTable
              rowKey="id"
              selectedRows={selectedRows}
              onSelectRow={this.handleSelectRows}
              //loading={loading}
              data={data}
              columns={this.columns}
              onChange={this.handleTableChange}
              scroll={{ x: 'fit-content' }}
            />
          </Col>
        </Row>
        <Modal width={680} visible={previewVisible} destroyOnClose footer={null} onCancel={this.handleCancel}>
          <h2>{previewNumber}</h2>
          {previewVideo ? (
            <video style={{ width: '100%' }} controls>
              <source src={previewImage}></source>
            </video>
          ) : (
            <img alt="preview" style={{ width: '100%' }} src={previewImage} />
          )}
        </Modal>
      </GridContent>
    );
  }
}

export default SourceContainers;
