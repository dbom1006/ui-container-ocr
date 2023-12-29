import StandardTable from '@/components/StandardTable';
import { API_URL, OCR_URL } from '@/utils/constants';
import { GridContent } from '@ant-design/pro-layout';
import {
  Button,
  Col,
  Input,
  Modal,
  Row,
  Tooltip
} from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import styles from './style.less';

const SourceContainers = ({ loadingButton, source, loading, data, dispatch}) => {
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState(source.state);
  const [selectedRows, setSelectedRows] = useState([]);
  const [preview, setPreview] = useState({
    visible: false,
    video: false,
    image: null,
    number: '',
  });

  const intervalId = useRef(null);

  useEffect(()=>{
    if(state == 'Processing') 
      intervalId.current = setInterval(() => {
        fetchData();
      }, 500);
    return ()=>{
      clearInterval(intervalId.current)
    }
  },[state])

  useEffect(() => {
    fetchData();
    return ()=>{
      clearInterval(intervalId.current)
    }
  }, []);

  const startWorker = () => {
    dispatch({
      type: 'sourceDetail/runWorker',
      payload: source.id,
      data: source.url,
      callback: () => {
        setState('Processing');
      },
    });
  };

  const stopWorker = () => {
    dispatch({
      type: 'sourceDetail/stopWorker',
      payload: source.id,
      callback: () => {
        setState('Pending');
      },
    });
  };

  const deleteContainer = (id) => {
    dispatch({
      type: 'sourceDetail/deleteContainer',
      payload: id,
      callback: () => {
        fetchData();
      },
    });
  };

  const handleSelectRows = (rows) => {
    setSelectedRows(rows);
  };

  const handleTableChange = (pagination, filter, sort) => {
    fetchData(pagination, filter, sort, data.search);
  };

  const handleSearch = (search) => {
    const { pagination, filter, sort } = data;
    fetchData(pagination, filter, sort, search);
  };

  const handleSearchChange = (e) => {
    const { pagination, filter, sort, search } = data;
    if (!e.target.value && search) {
      fetchData(pagination, filter, sort, '');
    }
  };

  const fetchData = async (
    pagination,
    filter,
    { field = 'updatedAt', order = 'desc' } = {},
    search
  ) => {
    await dispatch({
      type: 'sourceDetail/fetchDataContainer',
      payload: {
        pagination,
        filter: { ...filter, source: source.id },
        sort: { field, order },
        search,
      },
    });
    setLoaded(true);
  };

  const handleCancel = () => {
    setPreview((prevPreview) => ({ ...prevPreview, visible: false }));
  };

  const handlePreview = async (url, codeNumber, isVideo) => {
    setPreview({
      visible: true,
      video: isVideo,
      image: url,
      number: codeNumber,
    });
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: '',
      render: (data) => {
        const { image, url, source, employeeCode } = data.attributes;
        return (
          <img
            className={styles.image}
            height={48}
            src={API_URL + image?.data?.attributes.url}
            onClick={() => handlePreview(API_URL + image?.data?.attributes.url, employeeCode)}
          />
        );
      },
    },
    {
      title: 'Mã Container',
      dataIndex: 'attributes[code]',
      render: (code) => <b>{code}</b>,
    },
    {
      title: 'Thời gian',
      dataIndex: 'attributes[createdAt]',
      render: (time) => moment(time).format('HH:mm DD/MM/YY'),
    },
    {
      title: '',
      dataIndex: '',
      render: (container) => (
        <span className={styles.actions}>
          <Tooltip title="Delete">
            <Button
              type="link"
              shape="circle"
              icon="delete"
              onClick={() => deleteContainer(container.id)}
            />
          </Tooltip>
        </span>
      ),
    },
  ];

  return (
    <GridContent>
      <Row type="flex" gutter={16} justify="space-between" className={styles.header}>
        <Col lg={8}>
          {state == 'Processing' && (
            <Button type="danger" loading={loadingButton} onClick={stopWorker}>
              Tạm dừng Camera
            </Button>
          )}
          {state != 'Processing' && (
            <Button type="primary" loading={loadingButton} onClick={startWorker}>
              Kết nối Camera
            </Button>
          )}
          <Button type="primary" disabled={!selectedRows.length}>
            Xuất ra file CSV
          </Button>
        </Col>
        <Col lg={6}>
          <Input.Search
            placeholder="Tìm kiếm thông tin Camera"
            enterButton
            allowClear
            onChange={handleSearchChange}
            onSearch={handleSearch}
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
              style={{backgroundImage: '/icons/icon-512x512.png'}}
              src={OCR_URL + '/workers/' + source.id + '/video'}
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
            size="small"
            columns={columns}
            bordered={false}
            onChange={handleTableChange}
            scroll={{ x: 'fit-content' }}
          />
        </Col>
      </Row>
      <Modal
        width={480}
        visible={preview.visible}
        destroyOnClose
        footer={null}
        onCancel={handleCancel}
      >
        <h2>{preview.number}</h2>
        {preview.video ? (
          <video style={{ width: '100%' }} controls>
            <source src={preview.image}></source>
          </video>
        ) : (
          <img alt="preview" style={{ width: '100%' }} src={preview.image} />
        )}
      </Modal>
    </GridContent>
  );
};

export default connect(({ sourceDetail, loading }) => ({
  source: sourceDetail.current,
  data: sourceDetail.dataContainer,
  loading: loading.effects['sourceDetail/fetchDataContainer'],
  loadingButton:
    loading.effects['sourceDetail/runWorker'] || loading.effects['sourceDetail/stopWorker'],
}))(SourceContainers)