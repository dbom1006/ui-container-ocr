import {
  Avatar,
  Card,
  Col,
  Icon,
  Input,
  Row,
  Button,
  Table,
  Tooltip,
  message,
  Modal,
  Alert,
} from 'antd';
import React, { PureComponent } from 'react';
import { GridContent, PageHeaderWrapper } from '@ant-design/pro-layout';
import Link from 'umi/link';
import { connect } from 'dva';
import upperFirst from 'lodash/upperFirst';
import styles from './style.less';
import StandardTable from '@/components/StandardTable';
import moment from 'moment';
import Logo from '@/assets/logo.png';
import { OCR_URL } from '@/utils/constants';

// const isHired = state => ['CONFIRMED', 'WORKING', 'SEND_FUND', 'SEND_FUND_FAILED'].includes(state);
// const isCheckin = state => ['WORKING', 'SEND_FUND', 'SEND_FUND_FAILED'].includes(state);

@connect(({ sourceDetail, loading }) => ({
  source: sourceDetail.current,
  data: sourceDetail.dataContainer,
  loading: loading.effects['sourceDetail/fetchDataContainer'],
  loadingButton:
    loading.effects['sourceDetail/runWorker'] || loading.effects['sourceDetail/stopWorker'],
}))
class SourceContainers extends PureComponent {
  intervalId = null;

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      state: props.source.state,
      selectedRows: [],
      previewVisible: false,
      previewImage: null,
      previewVideo: false,
      previewNumber: '',
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  startWorker = () => {
    const { dispatch, source } = this.props;
    dispatch({
      type: 'sourceDetail/runWorker',
      payload: source._id,
      callback: () => {
        this.setState({ state: 'Processing' });
        this.intervalId = setInterval(() => {
          this.fetchData();
        }, 2000);
      },
    });
  };

  stopWorker = () => {
    const { dispatch, source } = this.props;
    dispatch({
      type: 'sourceDetail/stopWorker',
      payload: { id: source._id },
      callback: () => {
        this.setState({ state: 'Pending' });
        clearInterval(this.intervalId);
      },
    });
  };

  deleteContainer = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'sourceDetail/deleteContainer',
      payload: id,
      callback: () => {
        this.fetchData();
      },
    });
  };

  componentWillUnmount() {
    clearInterval(this.intervalId);
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

  fetchData = async (pagination, filter, { field = 'updatedAt', order = 'desc' } = {}, search) => {
    const { dispatch, source } = this.props;
    await dispatch({
      type: 'sourceDetail/fetchDataContainer',
      payload: {
        pagination,
        filter: { ...filter, source: source._id },
        sort: { field, order },
        search,
      },
    });
    this.setState({ loaded: true });
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
      title: 'Ảnh',
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
      title: 'Thời gian',
      dataIndex: 'trackingTime',
      render: time => moment(time).format('HH:mm DD/MM/YY'),
    },
    {
      title: '',
      dataIndex: '',
      render: container => (
        <span className={styles.actions}>
          <Tooltip title="Delete">
            <Button
              type="link"
              shape="circle"
              icon="delete"
              onClick={() => this.deleteContainer(container.id)}
            />
          </Tooltip>
        </span>
      ),
    },
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

    // },
  ];

  render() {
    const { data, loading, loadingButton, source } = this.props;
    const {
      state,
      loaded,
      selectedRows,
      previewVisible,
      previewImage,
      previewNumber,
      previewVideo,
    } = this.state;
    return (
      <GridContent>
        <Row type="flex" gutter={16} justify="space-between" className={styles.header}>
          <Col lg={8}>
            {state == 'Processing' && (
              <Button type="danger" loading={loadingButton} onClick={this.stopWorker}>
                Dừng Worker
              </Button>
            )}
            {state != 'Processing' && (
              <Button type="primary" loading={loadingButton} onClick={this.startWorker}>
                Bắt đầu Worker
              </Button>
            )}
            <Button type="primary" disabled={!selectedRows.length}>
              Xuất ra file CSV
            </Button>
          </Col>
          <Col lg={6}>
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
          <Col lg={12} className={styles.preview}>
            {source.type === 'Image' && (
              <img src={(source.file && source.file.url) || source.url} />
            )}
            {state == 'Processing' && (source.type === 'Camera' || source.type === 'Video') && (
              <img
                ref={el => (this.img = el)}
                src={OCR_URL + '/worker/' + source.id+'/video'}
                onError={() => {
                  this.img.src = '/icons/icon-512x512.png';
                }}
              />
            )}
            {state != 'Processing' && source.type === 'Camera' && <img src={source.url} />}
            {state != 'Processing' && source.type === 'Video' && (
              <video controls>
                <source
                  src={(source.file && source.file.url) || source.url}
                  type={source.file && source.file.mime}
                ></source>
              </video>
            )}
          </Col>
          <Col lg={12}>
            <StandardTable
              rowKey="id"
              loading={!loaded}
              data={data}
              columns={this.columns}
              onChange={this.handleTableChange}
              scroll={{ x: 'fit-content' }}
            />
          </Col>
        </Row>
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
      </GridContent>
    );
  }
}

export default SourceContainers;
