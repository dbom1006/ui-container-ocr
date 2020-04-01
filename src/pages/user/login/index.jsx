import { Alert, Button, Form, Input, Icon, Row, Col, Divider, Card } from 'antd';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import React, { Component } from 'react';
import Link from 'umi/link';
import { connect } from 'dva';
import styles from './style.less';
import { router } from 'umi';
import { setAuthority } from '@/utils/authority';

@connect(({ account, loading }) => ({
  account,
  submitting: loading.effects['account/login'],
}))
class Login extends Component {
  loginForm = undefined;

  state = {
    type: 'account',
    autoLogin: true,
    error: '',
  };

  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    if (form) {
      form.validateFields(this.submit);
    }
  };

  submit = (err, values) => {
    const { type, autoLogin } = this.state;
    this.setState({ error: '' });
    if (!err) {
      const { dispatch } = this.props;
      dispatch({
        type: 'account/login',
        payload: { ...values, autoLogin },
        callback: type => {
          if (type && type != 'customer') {
            this.setState({ error: "You don't have permission" });
          } else this.setState({ error: 'Email or password incorrect' });
        },
      });
    }
  };

  onTabChange = type => {
    this.setState({
      type,
    });
  };

  renderMessage = content => (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );

  render() {
    const {
      account,
      submitting,
      form: { getFieldDecorator },
    } = this.props;
    const { status, type: loginType } = account;
    const { type, autoLogin, error } = this.state;
    return (
      <Card bordered={false}>
        <Row gutter={12} type="flex" justify="end" className={styles.header}>
          <Col className={styles.textHeader}>What is Container Detection?</Col>
          <Col md={4} className={styles.btnSignUp}>
            <a href="https://nanonets.com/case-study/shipping-container" target="_blank">
              <Button style={{ height: 36 }} block>
                See more
              </Button>
            </a>
          </Col>
        </Row>
        <div className={styles.main}>
          <div className={styles.headerForm}>
            <h1>Sign in to CONDET</h1>
            <p>Enter your details below</p>
          </div>
          {error && this.renderMessage(error)}
          <Form onSubmit={this.handleSubmit} className="login-form">
            <Form.Item>
              {getFieldDecorator('username', {
                rules: [{ required: true, message: 'Please input your email!' }],
              })(
                <Input
                  className={styles.inputIcon}
                  prefix={<Icon className={styles.icon} type="user" />}
                  placeholder="Your email"
                />,
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input your Password!' }],
              })(
                <Input.Password
                  className={styles.inputIcon}
                  prefix={<Icon className={styles.icon} type="lock" />}
                  placeholder="Password"
                />,
              )}
            </Form.Item>
            <Row gutter={24} type="flex" align="middle" justify="space-between">
              <Col xs={12}>
                <Button
                  block
                  loading={submitting}
                  className={styles.btnSignIn}
                  type="primary"
                  htmlType="submit"
                >
                  Sign in
                </Button>
              </Col>
              <Col xs={12}>
                <a className={styles.textForgot} href="mailto:ttduc@tenomad.com" target="_blank">
                  Get Account to Login System
                </a>
              </Col>
            </Row>
            <Divider dashed />
            <div>
              <a className={styles.textForgot} href="https://tenomad.com" target="_blank">
                <Button block>Tenomad – You Dream It, We Build It</Button>
              </a>
            </div>
          </Form>
        </div>
      </Card>
    );
  }
}

export default Form.create()(Login);
