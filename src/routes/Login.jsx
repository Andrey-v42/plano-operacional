import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Checkbox, notification } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ExclamationCircleOutlined, SmileOutlined } from '@ant-design/icons';


const Login = () => {
    const [api, contextHolder] = notification.useNotification()
    const [searchParams] = useSearchParams();
    const pipeId = searchParams.get('pipeId');

    const [buttonLoading, setButtonLoading] = useState(false)
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
        setButtonLoading(true)
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
            if (data.permission != 'admin' && data.permission != 'planner' && data.permission != 'config' && data.permission != 'get' && data.permission != 'controle') {
                const responseEvento = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: 'pipe', docId: `pipeId_${pipeId}` })
                })
                const dataEvento = await responseEvento.json()
                for (const equipe of dataEvento.equipeEscalada) {
                    if (equipe.nome.trim().toLowerCase() == data.user.trim().toLowerCase()) {
                        usuarioEscalado = true
                        permissionEvento = equipe.funcao
                    }
                }
            } else {
                adminPrivilege = true
                permissionEvento = data.permission
            }

            if (usuarioEscalado == true || adminPrivilege == true) {
                localStorage.setItem('userId', data.userId)
                localStorage.setItem('authToken', JSON.stringify({ token: data.token, expirationDate: new Date().getTime() + 60 * 60 * 1000 }))
                localStorage.setItem('currentUser', data.user)
                localStorage.setItem('permission', data.permission)
                localStorage.setItem('permissionEvento', permissionEvento)
                localStorage.setItem('isAuthenticated', JSON.stringify({ value: 'true', expirationDate: new Date().getTime() + 60 * 60 * 1000 }))
                setButtonLoading(false)
                navigate(`/plano?pipeId=${pipeId}`);
            } else {
                setButtonLoading(false)
                openNotificationFailure('Seu usuário não foi vinculado a este evento, por favor entre em contato com a equipe de Gestão de Equipe Técnica.')
            }
        } else {
            setButtonLoading(false)
            openNotificationFailure('Usuário e/ou senha incorreto!')
        }
        

    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    useEffect(() => {
        const getEquipeEscalada = async (dataEvento) => {
            const token = 'pk_89229936_E5F2NN0B475NYDICS497EYR3O889V2XZ'
    
            const relationshipFields = [
                "Head", "C-CCO", "A&B Supervisores", "Tickets Supervisores", "Autoatendimento Supervisores",
                "RH Supervisores", "Controle Supervisores", "A&B Técnicos", "Tickets Técnicos",
                "Autoatendimento Técnicos", "RH Técnicos", "Controle Técnicos", "Runners", "Setup"
            ]
    
            const responseTask = await fetch(`https://api.clickup.com/api/v2/task/${dataEvento.taskId}`, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: 'pk_89229936_E5F2NN0B475NYDICS497EYR3O889V2XZ'
                }
            })

            const dataTask = await responseTask.json()
            const equipeEscalada = []
            for (const field of relationshipFields) {
                for (const customField of dataTask.custom_fields) {
                    if (customField.name == field) {
                        if (customField.value?.length > 0) {
                            for (const value of customField.value) {
                                equipeEscalada.push({ nome: value.name, funcao: customField.name })
                            }
                        }
                    }
                }
            }
    
            const responseEquipe = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/setDocMerge', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: `pipe`, docId: `pipeId_${pipeId}`, data: { equipeEscalada: equipeEscalada } })
            })
        }

        const verifyEquipeTecnica = async () => {
            try {
                const responseEvento = await fetch('https://southamerica-east1-zops-mobile.cloudfunctions.net/getDocAlternative', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ url: 'pipe', docId: `pipeId_${pipeId}` })
                })
                const dataEvento = await responseEvento.json()
    
                if(!dataEvento.equipeEscalada) {
                    getEquipeEscalada(dataEvento)
                }
            } catch (error) {
                openNotificationFailure('Não foi possível sincronizar a equipe escalada com o Clickup. Por favor entre em contato com o time de automatização.')
            }
        }

        if(pipeId) {
            verifyEquipeTecnica()
        }
    }, [pipeId])

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
                        <Button type="primary" loading={buttonLoading} htmlType="submit" style={{ width: '100%' }}>
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    );
};

export default Login;