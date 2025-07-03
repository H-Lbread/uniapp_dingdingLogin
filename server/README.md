# 钉钉登录后端服务

这是一个简单的Node.js后端服务，用于处理钉钉第三方登录，获取用户信息。

## 功能特点

- 处理钉钉OAuth2.0登录
- 获取钉钉用户基本信息
- 提供测试接口
- 支持CORS跨域请求

## 安装和运行

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
创建 `.env` 文件并填写以下内容：
```
DINGTALK_APP_KEY=your_app_key
DINGTALK_APP_SECRET=your_app_secret
PORT=3000
```

3. 启动服务：
```bash
npm start
```

## API接口

### 1. 测试接口

- 请求方式：GET
- 路径：`/api/test`
- 描述：用于测试服务器是否正常运行

### 2. 钉钉登录接口

- 请求方式：POST
- 路径：`/api/dingtalk/login`
- 请求体：
```json
{
    "authCode": "钉钉授权码"
}
```
- 响应示例：
```json
{
    "code": 0,
    "msg": "登录成功",
    "data": {
        "token": "demo_token_xxx",
        "userInfo": {
            "nick": "用户昵称",
            "unionid": "用户唯一标识",
            "openid": "应用内用户标识",
            "lastLoginTime": "2024-01-20T12:00:00.000Z"
        }
    }
}
```

## 注意事项

1. 请确保已在钉钉开发者后台正确配置了应用信息
2. 必须配置正确的回调域名
3. 请妥善保管您的AppSecret，不要泄露
4. 本示例代码仅供参考，生产环境请添加适当的安全措施

## 开发者文档

- [钉钉开发文档](https://open.dingtalk.com/document/)
- [OAuth 2.0开发文档](https://open.dingtalk.com/document/orgapp-server/obtain-user-token) 