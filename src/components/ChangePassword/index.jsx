import { Alert, Icon, Menu, Form, Input, Modal, message } from 'antd';
import React, { Component } from 'react';
import classNames from 'classnames';
import { GridContent } from '@ant-design/pro-layout';
import { connect } from 'dva';
import styles from './index.less';

const FormItem = Form.Item;
@connect(({ account, loading }) => ({
  account,
  submitting: loading.effects['account/changePassword'],
}))
class ChangePassword extends Component {
  state = {
    confirmDirty: false,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    if (form) {
      form.validateFields(this.submitChangePassword);
    }
  };

  submitChangePassword = (err, values) => {
    if (!err) {
      const { dispatch } = this.props;
      dispatch({
        type: 'account/changePassword',
        payload: values,
        callback: () => {
          this.props.form.resetFields();
          const { onClose } = this.props;
          onClose && onClose();
          message.success('Change password success');
        },
      });
    }
  };

  closePopup = () => {
    const { onClose } = this.props;
    onClose && onClose();
  };

  compareToFirstPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  };

  validateToNextPassword = (rule, value, callback) => {
    const { form } = this.props;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirmPassword'], { force: true });
    }
    callback();
  };

  handleConfirmBlur = e => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  render() {
    const {
      show = false,
      className,
      onSubmit,
      form: { getFieldDecorator },
      onCancel,
      visible,
      submitting,
      account,
    } = this.props;
    return (
      <GridContent>
        <Modal
          visible={show}
          title="Change Password"
          okText="Update"
          onCancel={this.closePopup}
          onOk={this.handleSubmit}
          confirmLoading={submitting}
        >
          <Form onSubmit={onSubmit} layout="vertical">
            <FormItem label="Current Password">
              {getFieldDecorator('current', {
                rules: [
                  {
                    required: true,
                    message: 'Please input current password!',
                  },
                ],
                initialValue: '',
              })(<Input.Password placeholder="Enter your current password" />)}
            </FormItem>
            <FormItem label="New password">
              {getFieldDecorator('password', {
                rules: [
                  {
                    required: true,
                    message: 'Please input your password!',
                  },
                  {
                    validator: this.validateToNextPassword,
                  },
                ],
                initialValue: '',
              })(<Input.Password placeholder="Enter new password" />)}
            </FormItem>
            <FormItem label="Confirm new password">
              {getFieldDecorator('confirmPassword', {
                rules: [
                  {
                    required: true,
                    message: 'Please confirm your password!',
                  },
                  {
                    validator: this.compareToFirstPassword,
                  },
                ],
                initialValue: '',
              })(
                <Input.Password
                  placeholder="Enter confirm password"
                  onBlur={this.handleConfirmBlur}
                />,
              )}
            </FormItem>
          </Form>
        </Modal>
      </GridContent>
    );
  }
}

export default Form.create()(ChangePassword);
