import { Col, Row, PageHeader, Icon, Card } from 'antd';
import React, { Component } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import { connect } from 'dva';
import styles from './style.less';
import moment from 'moment';

@connect(({ containerDetail, loading }) => ({
  container: containerDetail.current,
  loading: loading.effects['containerDetail/fetchCurrent'],
}))
class DetailContainer extends Component {
  state = {
    previewVisible: false,
    previewImage: null,
    previewVideo: false,
    previewNumber: '',
  };

  componentDidMount = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'containerDetail/fetchCurrent',
      payload: match.params.id,
    });
  };

  handlePreview = async (url, codeNumber, isVideo) => {
    this.setState({
      previewImage: url,
      previewVideo: isVideo,
      previewNumber: codeNumber,
      previewVisible: true,
    });
  };

  renderImage = container => {
    let { image, source, codeNumber, url } = container;
    image = url ? { url } : image || source;
    if (!image) return null;
    return [
      <img className={styles.image} height={60} src={image.url.replace('/out/', '/out/full-')} />,
      <img
        className={styles.image}
        height={60}
        src={image.url}
        onClick={() => this.handlePreview(image.url, codeNumber)}
      />,
    ];
  };

  render() {
    const { container, loading } = this.props;
    let { image, source, codeNumber, url } = container;
    image = url ? { url } : image || source;
    if (!image) image = { url: '' };
    return (
      <PageHeader
        className="site-page-header"
        onBack={() => window.history.back()}
        title="Chi tiết Container"
      >
        <Card loading={loading} bordered={false}>
          <GridContent>
            <Row gutter={24}>
              <Col md={8} className={styles.content}>
                <div>
                  <h2>{container.codeNumber}</h2>
                </div>
                <div><i>{moment(container.updatedAt).format('HH:mm DD/MM/YYYY')}</i></div>
                <div>
                  <span>Xác nhận: </span> {container.isConfirmed && <Icon type="check" />}
                </div>
                <div>
                  <span>Mã Owner:</span> {container.owner}
                </div>
                <div>
                  <span>Mã Seri:</span> {container.serial}
                </div>
                <div>
                  <span>Type:</span> {container.type}
                </div>
                <div>
                  <span>Độ tin cậy:</span>
                  {container.reliability}
                </div>
                <div>
                  <img
                    className={styles.image}
                    src={image.url}
                    onClick={() => this.handlePreview(image.url, codeNumber)}
                  />
                </div>
              </Col>
              <Col md={16} className={styles.preview}>
                <img src={image.url.replace('/out/', '/out/full-')} />
              </Col>
            </Row>
          </GridContent>
        </Card>
      </PageHeader>
    );
  }
}

export default DetailContainer;
