import { Col, Row, PageHeader, Icon } from 'antd';
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
    let { image, source, codeNumber } = container;
    image = image || source;
    if (source && source.type == 'Video')
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
        src={image && image.url}
        onClick={() => this.handlePreview(image.url, codeNumber)}
      />
    );
  }

  render() {
    const { container } = this.props;
    return (
      <PageHeader 
        className="site-page-header"
        onBack={() => window.history.back()}
        title="Container detail">
        <GridContent>
          <Row gutter={24}>
            <Col md={8} className={styles.content}>
              <div>
                <span>Code Number:</span> {container.codeNumber}
              </div>
              <div>
                <span>Confirmed: </span> {container.isConfirmed && <Icon type="check" />}
              </div>
              <div>
                <span>Owner:</span> {container.owner}
              </div>
              <div>
                <span>Seri:</span> {container.serial}
              </div>
              <div>
                <span>Reliability:</span>{container.reliability}                
              </div>
              <div>
                <span>Processing Time:</span>{container.processingTime}                
              </div>
              <div>
                <span>Type:</span> {container.type}
              </div>
              <div>
                <span>Time:</span> {moment(container.updatedAt).format('HH:mm DD/MM/YYYY')}
              </div>              
            </Col>         
            <Col md={16} className={styles.image}>
              {this.renderImage(container)}
            </Col>
          </Row>
        </GridContent>
      </PageHeader>
    );
  }
}

export default DetailContainer;
