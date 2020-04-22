import { Col, Row, List, Tag } from 'antd';
import React, { Component } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import Link from 'umi/link';
import { connect } from 'dva';
import styles from './style.less';
import moment from 'moment';
import EmbededGoogleMap from '@/components/GoogleMaps/EmbededGoogleMap';
import { round2 } from '@/utils/utils';
import { SOURCE_STATES } from '@/utils/constants';

@connect(({ sourceDetail, settings, loading }) => ({
  source: sourceDetail.current,
  positions: settings.positions,
  loading: loading.effects['sourceDetail/fetchCurrent'],
}))
class DetailSource extends Component {
  renderState = (state = 'Pending') => {
    let color = 'gold';
    if (state == 'Processing') color = '#1890ff';
    if (state == 'Finished') color = '#52c41a';
    if (state == 'Failed') color = '#f5222d';
    return <Tag color={color}>{state}</Tag>;
  };
  render() {
    const { source } = this.props;
    return (
      <GridContent>
        <Row gutter={24}>
          <Col md={8} className={styles.content}>
            <div>
              <span>Tên:</span> {source.name}
            </div>
            <div>
              <span>Trạng thái: </span>
              <Tag color={SOURCE_STATES[source.state].color}>
                {SOURCE_STATES[source.state].label}
              </Tag>
            </div>
            <div>
              <span>Chế độ:</span> {source.isOffline ? 'Offline' : 'Online'}
            </div>
            <div>
              <span>Thời gian:</span> {moment(source.updatedAt).format('HH:mm DD/MM/YYYY')}
            </div>
            <div>
              <span>URL Nguồn/Camera:</span>{' '}
              <a href={source.url} target="_blank">
                {source.url}
              </a>
            </div>
            <div>
              <span>Loại:</span> {source.type}
            </div>
            <div>
              <span>Ghi chú thêm:</span> {source.tag}
            </div>
          </Col>
          <Col md={16} className={styles.content}>
            <div>
              <span>File preview:</span>
            </div>
            <div className={styles.preview}>
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
            </div>
          </Col>
        </Row>
      </GridContent>
    );
  }
}

export default DetailSource;
