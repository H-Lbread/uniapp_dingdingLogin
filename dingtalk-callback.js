const http = require('http');
const os = require('os');

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
                function handleCallback() {
                    const code = getUrlParam('code');
                    console.log('获取到钉钉授权码：', code);
                    
                    if (code) {
                        // 显示成功信息
                        document.getElementById('message').innerHTML = '授权成功，正在处理...';
                        
                        // 创建一个隐藏的iframe用于通信
                        const iframe = document.createElement('iframe');
                        iframe.style.display = 'none';
                        document.body.appendChild(iframe);
                        
                        // 尝试多种方式发送消息
                        try {
                            // 1. 尝试使用uni-app的方式
                            if (window.plus) {
                                window.plus.message.createMessage({
                                    type: 'dingtalk_code',
                                    code: code
                                });
                            }
                            
                            // 2. 尝试向父窗口发送消息
                            window.parent.postMessage({
                                type: 'dingtalk_code',
                                code: code
                            }, '*');
                            
                            // 3. 尝试向opener发送消息
                            if (window.opener) {
                                window.opener.postMessage({
                                    type: 'dingtalk_code',
                                    code: code
                                }, '*');
                            }
                            
                            // 4. 存储code到localStorage
                            localStorage.setItem('dingtalk_code', code);
                            
                            // 5. 显示成功信息，并提供手动返回按钮
                            document.getElementById('message').innerHTML = '授权成功！<br/><button onclick="window.close()">关闭页面</button>';
                            
                        } catch (e) {
                            console.error('发送消息失败：', e);
                            // 显示code，让用户可以手动复制
                            document.getElementById('message').innerHTML = 
                                '授权成功，请复制以下授权码并返回APP：<br/>' +
                                '<textarea onclick="this.select()" style="width: 100%; margin: 10px 0;">' + 
                                code + 
                                '</textarea><br/>' +
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