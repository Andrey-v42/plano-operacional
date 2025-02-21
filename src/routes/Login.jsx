import React from 'react';
import { Form, Input, Button, Checkbox, notification } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Login = () => {
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');

    const navigate = useNavigate()

    const openNotificationFailure = (text) => {
        api.open({
            message: 'Erro',
            description: text,
            icon: (
                <ExclamationCircleOutlined
                    style={{
                        color: '#108ee9',
                    }}
                />
            ),
        });
    };

    const onFinish = async (values) => {
        const response = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/employeeLogin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...values }),
        })
        
        if(response.status === 200) {
            const data = await response.json()
            localStorage.setItem('authToken', JSON.stringify({ token: data.token, expirationDate: new Date().getTime() +  60 * 60 * 1000 }))
            localStorage.setItem('currentUser', data.user)
            localStorage.setItem('permission', data.permission)
            localStorage.setItem('isAuthenticated', JSON.stringify({ value: 'true', expirationDate: new Date().getTime() +  60 * 60 * 1000 }))
            navigate(`/plano?pipeId=${pipeId}`);
        } else {
            openNotificationFailure('Usuário e/ou senha incorreto!')
        }

    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div style={{ maxWidth: '300px', margin: 'auto', padding: '50px' }}>
            <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Insira seu email!' }]}
                >
                    <Input placeholder="Email" />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Insira sua senha!' }]}
                >
                    <Input.Password placeholder="Senha" />
                </Form.Item>

                <Form.Item name="remember" valuePropName="checked">
                    <Checkbox>Lembrar usuário/senha</Checkbox>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                        Log in
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;