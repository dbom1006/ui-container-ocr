import { Alert, Menu, Form, Input, Modal, Row, Checkbox, notification, message } from 'antd';
import React, { Component } from 'react';
import classNames from 'classnames';
import { GridContent } from '@ant-design/pro-layout';
import { connect } from 'dva';
import moment from 'moment';

const FormItem = Form.Item;

@connect(({ loading }) => ({
  submitting: loading.effects['upcomingEvent/updateEvent'],
}))
class PopupEditEvent extends Component {
  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    if (form) {
      form.validateFields(this.submit);
    }
  };

  submit = (err, values) => {
    if (!err) {
      const { dataPopup, dispatch } = this.props;
      const params = { ...values };
      params.id = dataPopup.id;
      dispatch({
        type: 'upcomingEvent/updateEvent',
        payload: params,
        callback: () => {
          this.props.form.resetFields();
          const { onClose } = this.props;
          onClose && onClose();
          message.success('Update information success');
        },
      });
    }
  };

  closePopup = () => {
    const { onClose, dispatch } = this.props;
    onClose && onClose();
  };

  render() {
    const {
      dataPopup,
      show = false,
      className,
      onSubmit,
      form: { getFieldDecorator },
      onCancel,
      visible,
      submitting,
    } = this.props;
    const { name = '', address = '', parking = '', details = '' } = dataPopup || {};
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <GridContent>
        <Modal
          visible={show}
          title="Update information Event"
          okText="Update"
          onCancel={this.closePopup}
          onOk={this.handleSubmit}
          confirmLoading={submitting}
        >
          <Form onSubmit={onSubmit} {...formItemLayout}>
            <FormItem label="Name">
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    message: 'Please input name!',
                  },
                ],
                initialValue: name,
              })(<Input placeholder="Fill name" />)}
            </FormItem>
            <FormItem label="Location">
              {getFieldDecorator('address', {
                rules: [
                  {
                    required: true,
                    message: 'Please input address!',
                  },
                ],
                initialValue: address,
              })(<Input placeholder="Fill address" />)}
            </FormItem>
            <FormItem label="Parking">
              {getFieldDecorator('parking', {
                rules: [
                  {
                    required: true,
                    message: 'Please input parking!',
                  },
                ],
                initialValue: parking,
              })(<Input placeholder="Fill parking" />)}
            </FormItem>
            <FormItem label="Description">
              {getFieldDecorator('details', {
                initialValue: details,
              })(<Input.TextArea placeholder="Fill description" />)}
            </FormItem>
          </Form>
        </Modal>
      </GridContent>
    );
  }
}

export default Form.create()(PopupEditEvent);
