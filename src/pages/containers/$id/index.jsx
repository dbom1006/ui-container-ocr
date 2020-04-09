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

  componentDidMount = () => {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'containerDetail/fetchCurrent',
      payload: match.params.id,
    });
  };

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
                <span>Url:</span>{' '}                
              </div>
              <div>
                <span>Type:</span> {container.type}
              </div>
              <div>
                <span>Time:</span> {moment(container.updatedAt).format('HH:mm DD/MM/YYYY')}
              </div>              
            </Col>         
          </Row>
        </GridContent>
      </PageHeader>
    );
  }
}

export default DetailContainer;
