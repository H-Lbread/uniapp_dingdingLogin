const http = require('http');
const os = require('os');
const axios = require('axios');

// 获取本机IP地址
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            // 跳过内部IP和非IPv4地址
            if (interface.internal || interface.family !== 'IPv4') continue;
            return interface.address;
        }
    }
    return 'localhost';
}

const localIP = getLocalIP();
const port = 3000;

const server = http.createServer((req, res) => {
    console.log(`收到请求: ${req.url}`);
    
    // 允许跨域访问
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.url.startsWith('/dingtalk/callback')) {
        console.log('处理钉钉回调请求');
        // 返回回调页面
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>钉钉登录回调</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script>
                // 解析URL参数
                function getUrlParam(name) {
                    const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                    const r = window.location.search.substr(1).match(reg);
                    if (r != null) return decodeURIComponent(r[2]); return null;
                }
                
                // 主函数
                async function handleCallback() {
                    const code = getUrlParam('code');
                    console.log('获取到钉钉授权码：', code);
                    
                    if (code) {
                        // 显示成功信息
                        document.getElementById('message').innerHTML = '授权成功，正在获取用户信息...';
                        
                        try {
                            // 调用登录接口获取用户信息
                            const response = await fetch('http://localhost:3000/api/dingtalk/login', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({ authCode: code })
                            });
                            
                            const result = await response.json();
                            
                            if (result.code === 0) {
                                // 显示用户信息
                                document.getElementById('message').innerHTML = 
                                    '<h4>登录成功！</h4>' +
                                    '<pre style="text-align: left; margin: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px;">' + 
                                    JSON.stringify(result.data, null, 2) +
                                    '</pre>' +
                                    '<button onclick="window.close()">关闭页面</button>';
                                
                                // 存储用户信息
                                localStorage.setItem('userInfo', JSON.stringify(result.data));
                            } else {
                                throw new Error(result.msg || '获取用户信息失败');
                            }
                            
                        } catch (e) {
                            console.error('获取用户信息失败：', e);
                            document.getElementById('message').innerHTML = 
                                '<h4 style="color: red;">获取用户信息失败</h4>' +
                                '<p>错误信息：' + e.message + '</p>' +
                                '<p>授权码：</p>' +
                                '<textarea onclick="this.select()" style="width: 100%; margin: 10px 0;">' + 
                                code + 
                                '</textarea>' +
                                '<button onclick="window.close()">关闭页面</button>';
                        }
                    } else {
                        document.getElementById('message').innerHTML = '<span style="color: red;">未获取到授权码</span>';
                    }
                }
                </script>
                <style>
                    body { 
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        text-align: center;
                    }
                    button {
                        margin: 10px;
                        padding: 10px 20px;
                        background-color: #1890ff;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    textarea {
                        padding: 10px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                    }
                    pre {
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                </style>
            </head>
            <body onload="handleCallback()">
                <div style="text-align: center; padding: 20px;">
                    <h3>钉钉登录处理中</h3>
                    <p id="message">正在处理授权信息...</p>
                </div>
            </body>
            </html>
        `);
    } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <h1>钉钉登录测试服务器</h1>
            <p>服务器运行在: http://${localIP}:${port}</p>
            <p>回调地址为: http://${localIP}:${port}/dingtalk/callback</p>
        `);
    }
});

server.listen(port, '0.0.0.0', () => {
    console.log(`\n钉钉登录测试服务器已启动！`);
    console.log(`\n请在钉钉开发者平台配置以下回调域名：`);
    console.log(`http://${localIP}:${port}`);
    console.log(`\n完整的回调地址为：`);
    console.log(`http://${localIP}:${port}/dingtalk/callback`);
    console.log(`\n请确保手机和电脑在同一个局域网内！`);
}); 