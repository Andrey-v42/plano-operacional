import React from 'react';
import { Form, Input, Button, Checkbox, notification } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ExclamationCircleOutlined, SmileOutlined } from '@ant-design/icons';

const Login = () => {
    const [api, contextHolder] = notification.useNotification()
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

        let usuarioEscalado = false
        let permissionEvento = ''
        let adminPrivilege = false
        if (response.status === 200) {
            const data = await response.json()
            if (data.permission != 'admin' && data.permission != 'config' && data.permission != 'get' && data.permission != 'planner' && data.permission != 'controle') {
                const responseEvento = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: 'pipe', docId: `pipeId_${pipeId}` })
                })
                const dataEvento = await responseEvento.json()
                for (const equipe of dataEvento.equipeEscalada) {
                    if (equipe.nome == data.user) {
                        usuarioEscalado = true
                        permissionEvento = equipe.funcao
                    }
                }
            } else {
                adminPrivilege = true
                permissionEvento = data.permission
            }

            if (usuarioEscalado == true || adminPrivilege == true) {
                localStorage.setItem('authToken', JSON.stringify({ token: data.token, expirationDate: new Date().getTime() + 60 * 60 * 1000 }))
                localStorage.setItem('currentUser', data.user)
                localStorage.setItem('permission', data.permission)
                localStorage.setItem('permissionEvento', permissionEvento)
                localStorage.setItem('isAuthenticated', JSON.stringify({ value: 'true', expirationDate: new Date().getTime() + 60 * 60 * 1000 }))
                navigate(`/plano?pipeId=${pipeId}`);
            } else {
                openNotificationFailure('Seu usuário não foi vinculado a este evento, por favor entre em contato com a equipe de Gestão de Equipe Técnica.')
            }
        } else {
            openNotificationFailure('Usuário e/ou senha incorreto!')
        }

    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <>
            {contextHolder}
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
        </>
    );
};

export default Login;