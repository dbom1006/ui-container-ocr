import { Col, Icon, Row, Button, Modal, Tooltip, List, message } from 'antd';
import React, { Component } from 'react';
import { GridContent } from '@ant-design/pro-layout';
import Link from 'umi/link';
import { connect } from 'dva';
import moment from 'moment';
import { Redirect } from 'umi';
import styles from './style.less';
import PopupEditEvent from './components/PopupEditEvent';
import EmbededGoogleMap from '@/components/GoogleMaps/EmbededGoogleMap';
import { round2 } from '@/utils/utils';

@connect(({ upcomingEvent, settings, loading }) => ({
  event: upcomingEvent.current,
  positions: settings.positions,
  loading: loading.effects['upcomingEvent/fetchCurrent'],
}))
class UpcomingInfo extends Component {
  state = {
    showPopup: false,
    dataPopup: null,
  };

  deleteEvent = () => {
    const { dispatch, event } = this.props;
    dispatch({
      type: 'upcoming/remove',
      payload: event.id,
      callback: () => {
        message.success('Delete event success');
      },
    });
  };

  handleDeleteEvent = () => {
    const { event } = this.props;
    Modal.confirm({
      title: 'Are you sure delete this event?',
      content: `${event.name}, ${moment(event.startTime).format('YYYY-MM-DD HH:mm')}`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: this.deleteEvent,
    });
  };

  showPopupEdit = event => {
    this.setState({
      showPopup: true,
      dataPopup: event,
    });
  };

  handleClosePopup = () => {
    this.setState({ showPopup: false, dataPopup: null });
    const { event, dispatch } = this.props;
    dispatch({
      type: 'upcomingEvent/fetchCurrent',
      payload: event.id,
    });
  };

  renderJobInfo = job => {
    const { positions } = this.props;
    const position = positions.find(x => x.id == job.position.id);
    const tilte = [
      `${job.quantity} ${job.position.name} ($${job.originRateHour}/hour)`.trim(),
      `${job.tip} ${job.tipTotal ? `($${job.tipTotal})` : ''}`.trim(),
    ]
      .filter(Boolean)
      .join(' - ');
    return (
      <List.Item className={styles.jobItem}>
        <List.Item.Meta
          title={tilte}
          description={`${moment(job.startTime).format('LL')} ${moment(job.startTime).format(
            'HH:mm',
          )} - ${moment(job.endTime).format('HH:mm')} (Break ${job.unpaidBreak * 60} mins)`}
        />
        <span>${job.originTotal}</span>
      </List.Item>
    );
  };

  getTotalPayment = () => {
    const { event } = this.props;
    return event.jobs.reduce((acc, cur) => acc + cur.originTotal, 0);
  };

  getTotalTip = () => {
    const { event } = this.props;
    return event.jobs.reduce((acc, cur) => {
      if (cur.tip == 'Will tip onsite') return acc;
      return acc + cur.tipTotal;
    }, 0);
  };

  render() {
    const { event } = this.props;
    const { showPopup, dataPopup } = this.state;
    const disabled = moment(event.startTime).diff(moment(), 'hour') <= 48;
    const diffHours = moment(event.startTime).diff(
      moment()
        .startOf('day')
        .toDate(),
      'hour',
    );
    if (diffHours <= 0) {
      return <Redirect to="/upcoming" />;
    }
      return (
        <GridContent>
          <Row gutter={24}>
            <Col md={12} className={styles.content}>
              <div>
                <span>Name:</span> {event.name}
              </div>
              <div>
                <span>Date:</span> {moment(event.startTime).format('YYYY-MM-DD HH:mm')}
              </div>
              <div>
                <span>Parking:</span> {event.parking}
              </div>
              <div>
                <div>
                  <span>Hosted by:</span> {event.user ? event.user.name : 'N/A'}
                </div>
                Email: {event.user && event.user.email}
                <br />
                Phone: {event.user && event.user.phone}
              </div>
              <div>
                <span>Onsite Contact</span>
                <br />
                Name: {event.contact && event.contact.name}
                <br />
                Phone: {event.contact && event.contact.phone}
              </div>
              <div>
                <span>No of Staffing:</span>{' '}
                {event.jobs.reduce((acc, cur) => acc + cur.quantity, 0)}
              </div>
              <div>
                <span>Jobs Details</span>
                <List
                  size="large"
                  dataSource={event.jobs}
                  renderItem={job => this.renderJobInfo(job)}
                />
              </div>
              <div>
                <span>Payment</span>
                {this.getTotalTip() > 0 && (
                  <>
                    <Row type="flex" justify="space-between" className={styles.payment}>
                      <p>Total Amount For Job:</p>
                      <span>${round2(this.getTotalPayment() - this.getTotalTip())}</span>
                    </Row>
                    <Row type="flex" justify="space-between" className={styles.payment}>
                      <p>Total Tip Included In Charge:</p>
                      <span>${this.getTotalTip()}</span>
                    </Row>
                  </>
                )}
                <Row type="flex" justify="space-between" className={styles.payment}>
                  <p>
                    <b>Final Amount To be Paid:</b>
                  </p>
                  <span>
                    <b>${this.getTotalPayment()}</b>
                  </span>
                </Row>
                <p>
                  Note: We will send a square invoice for 10% of the booking at the time of the
                  booking. We will then send an invoice for the remaining balance within 7 days of
                  the event. Please reach out to{' '}
                  <a href="mailto:concierge@hiretend.com​">concierge@hiretend.com​</a>
                </p>
                <p>
                  If you are an enterprise account we will invoice you as normal, please ignore this
                  note. Thanks!
                </p>
              </div>
              {!disabled && (
                <Row type="flex" className={styles.actions}>
                  <Link to={`/booking/${event.id}`}>
                    <Button type="primary" disabled={disabled} icon="edit">
                      Edit{' '}
                    </Button>
                  </Link>
                  <Button
                    type="danger"
                    disabled={disabled}
                    icon="delete"
                    onClick={this.handleDeleteEvent}
                  >
                    Delete
                  </Button>
                </Row>
              )}
              <PopupEditEvent
                show={showPopup}
                dataPopup={dataPopup}
                onClose={this.handleClosePopup}
              ></PopupEditEvent>
            </Col>
            <Col md={12} className={styles.content}>
              <div>
                <span>Location:</span> {event.address}
              </div>
              <div>
                <EmbededGoogleMap address={event.address} height={250} title="Event address" />
              </div>
              <div>
                <span>Location detail:</span> {event.locationDetails}
              </div>
              <div>
                <span>Description:</span>
                <br />
                <p>{event.details}</p>
              </div>
              <div>
                <span>Instructions:</span> {event.instructions}
              </div>
            </Col>
          </Row>
          {disabled && (
            <Row>
              <p className={styles.alert}>
                The event will start within 48 hours, so you cannot edit it via the website. Please
                contact <a href="mailto:concierge@hiretend.com">concierge@hiretend.com</a> to change
                your event details/request.
              </p>
            </Row>
          )}
        </GridContent>
      );
  }
}

export default UpcomingInfo;
