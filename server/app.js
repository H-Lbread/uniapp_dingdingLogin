const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(cors());

// 钉钉应用配置
const config = {
    appKey: 'dingkvjzimyeiodlxmcq',
    appSecret: 'YM2aC6UVE04iizPCAVMPCod_28k1kfOl3v_OMPEt1h-lAzdo7ExG0GNnc_a174Ua'
};

// 获取用户信息的函数
async function getUserInfo(authCode) {
    try {
        // 1. 使用临时授权码获取用户token和基本信息
        const tokenResponse = await axios.post('https://api.dingtalk.com/v1.0/oauth2/userAccessToken', {
            clientId: config.appKey,
            clientSecret: config.appSecret,
            code: authCode,
            grantType: 'authorization_code'
        });

        console.log('Token Response:', JSON.stringify(tokenResponse.data, null, 2));

        if (!tokenResponse.data.accessToken) {
            throw new Error('获取access_token失败');
        }

        const { accessToken, unionId } = tokenResponse.data;

        // 2. 使用unionId获取用户详细信息
        const userResponse = await axios.get(`https://api.dingtalk.com/v1.0/contact/users/${unionId}`, {
            headers: {
                'x-acs-dingtalk-access-token': accessToken,
                'Content-Type': 'application/json'
            }
        });

        console.log('User Response:', JSON.stringify(userResponse.data, null, 2));

        // 3. 返回组合的用户信息
        return {
            accessToken: accessToken,
            userInfo: {
                ...userResponse.data,  // 包含用户的详细信息
                unionId: unionId,
                expireIn: tokenResponse.data.expireIn,
                refreshToken: tokenResponse.data.refreshToken,
                lastLoginTime: new Date().toISOString()
            }
        };
    } catch (error) {
        // 打印完整的错误信息
        console.error('获取用户信息出错:');
        if (error.response) {
            console.error('Error Response:', JSON.stringify(error.response.data, null, 2));
            console.error('Error Status:', error.response.status);
            console.error('Error Headers:', error.response.headers);
        } else if (error.request) {
            console.error('Error Request:', error.request);
        } else {
            console.error('Error Message:', error.message);
        }
        throw error;
    }
}

// 钉钉登录接口
app.post('/api/dingtalk/login', async (req, res) => {
    try {
        const { authCode } = req.body;
        
        if (!authCode) {
            return res.status(400).json({
                code: -1,
                msg: '缺少授权码'
            });
        }
        
        // 获取用户信息
        const { accessToken, userInfo } = await getUserInfo(authCode);
        
        res.json({
            code: 0,
            msg: '登录成功',
            data: {
                token: accessToken,
                userInfo
            }
        });
        
    } catch (error) {
        console.error('登录处理出错:');
        // 返回更详细的错误信息
        res.status(500).json({
            code: -1,
            msg: '登录失败',
            error: {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            }
        });
    }
});

// 测试接口
app.get('/api/test', (req, res) => {
    res.json({
        code: 0,
        msg: '服务器运行正常',
        time: new Date().toISOString()
    });
});

// 启动服务器
app.listen(port, () => {
    console.log(`服务器已启动，监听端口 ${port}`);
    console.log(`测试接口: http://localhost:${port}/api/test`);
    console.log(`钉钉登录接口: POST http://localhost:${port}/api/dingtalk/login`);
}); 