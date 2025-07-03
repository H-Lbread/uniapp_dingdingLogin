<template>
	<view class="content">
		<image class="logo" src="@/static/login/logo.png"></image>
		<view class="login-form">
			<view class="input-item">
				<!-- <image class="icon" src="@/static/login/user.png"></image> -->
				<input type="text" v-model="username" placeholder="请输入账号" />
			</view>
			<view class="input-item">
				<!-- <image class="icon" src="@/static/login/password.png"></image> -->
				<input type="password" v-model="password" placeholder="请输入密码" />
			</view>
			<view class="remember-pwd">
				<checkbox :checked="rememberPwd" @change="handleRememberPwdChange" color="#ff6a00" />
				<text>记住密码</text>
			</view>
			<button class="login-btn" @click="handleLogin">登录</button>
			<view class="other-login">
				<text>其他方式登录</text>
				<view class="other-icons">
					<image class="other-icon" src="@/static/login/dingding.png" @click="handleDingDingLogin"></image>
				</view>
			</view>
		</view>
		
		<!-- 添加WebView组件 -->
		<web-view v-if="showWebView" :src="dingdingUrl" @message="handleWebViewMessage"></web-view>
	</view>
</template>

<script>
	import { setToken, getToken } from '@/utils/auth.js'
	
	export default {
		data() {
			const currentUrl = window?.location?.href || '';
			const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');
			
			// 获取本机IP，实际开发时替换为你的电脑IP地址
			const serverIP = '192.168.6.91:3000'; // 这里需要替换为你的电脑IP地址
			const serverPort = 3000;
			
			return {
				username: '',
				password: '',
				rememberPwd: false,
				showWebView: false,
				dingdingUrl: '',
				dingConfig: {
					appId: 'dingkvjzimyeiodlxmcq', // 替换为您在钉钉开放平台创建的应用的AppKey
					redirectUri: encodeURIComponent(`http://${serverIP}/dingtalk/callback`)
				}
			}
		},
		onLoad(options) {
			// 如果已登录，直接跳转到首页
			if (getToken()) {
				uni.reLaunch({
					url: '/pages/Home/index'
				})
				return
			}
			
			// #ifdef H5
			// 获取url中的code参数
			const code = options.code
			if (code) {
				// 如果有code参数，说明是钉钉登录回调
				this.dingLoginToServer(code)
			}
			// #endif
		},
		methods: {
			handleLogin() {
				// 处理普通登录逻辑
				if (!this.username || !this.password) {
					uni.showToast({
						title: '请输入账号和密码',
						icon: 'none'
					})
					return
				}
				
				uni.showLoading({
					title: '登录中...'
				})
				
				// 调用登录接口
				uni.request({
					url: 'your_api_url/login',
					method: 'POST',
					data: {
						username: this.username,
						password: this.password
					},
					
					success: (res) => {
						if (res.data.code === 0) {
							// 保存token
							setToken(res.data.data.token)
							// 保存用户信息
							uni.setStorageSync('userInfo', res.data.data.userInfo)
							
							// 跳转到首页
							uni.reLaunch({
								url: '/pages/Home/index'
							})
						} else {
							uni.showToast({
								title: res.data.msg || '登录失败',
								icon: 'none'
							})
						}
					},
					fail: (err) => {
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						})
					},
					complete: () => {
						uni.hideLoading()
					}
				})
			},
			// 处理钉钉登录
			handleDingDingLogin() {
				// 显示提示，确认事件被触发
				uni.showToast({
					title: '正在打开钉钉登录',
					icon: 'none',
					duration: 2000
				});
				
				console.log('点击钉钉登录按钮');
				
				// #ifdef H5
				console.log('H5环境，执行H5登录');
				this.dingdingH5Login();
				// #endif
				
				// #ifdef APP-PLUS
				console.log('APP环境，执行APP登录');
				
				// 显示加载提示
				uni.showLoading({
					title: '正在打开钉钉...'
				});
				
				try {
					// 使用第三方应用的方式生成授权链接
					const authUrl = `https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${this.dingConfig.appId}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=${this.dingConfig.redirectUri}`;
					console.log('授权URL:', authUrl);
					
					// 使用系统浏览器打开
					plus.runtime.openURL(authUrl, (err) => {
						if (err) {
							console.error('打开浏览器失败：', err);
							// 如果打开失败，尝试使用内置WebView
							this.dingdingUrl = authUrl;
							this.showWebView = true;
						}
						uni.hideLoading();
						
						// 开始轮询检查授权状态
						this.startCheckAuthStatus();
					});
					
					// 5秒后如果还在加载中，就隐藏加载提示
					setTimeout(() => {
						uni.hideLoading();
					}, 5000);
					
				} catch (error) {
					console.error('打开钉钉登录出错：', error);
					uni.hideLoading();
					uni.showToast({
						title: '打开钉钉失败，请重试',
						icon: 'none',
						duration: 2000
					});
				}
				// #endif
			},
			// H5端钉钉登录
			dingdingH5Login() {
				const url = `https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${this.dingConfig.appId}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=${this.dingConfig.redirectUri}`;
				console.log('H5钉钉登录URL:', url);
				window.location.href = url;
			},
			// 处理WebView消息
			handleWebViewMessage(event) {
				console.log('收到WebView消息：', event);
				
				try {
					const { data } = event;
					
					// 检查URL中是否包含授权码
					if (data.url && data.url.includes('code=')) {
						console.log('从URL中检测到code');
						const code = this.getCodeFromUrl(data.url);
						if (code) {
							console.log('成功获取到code:', code);
							this.showWebView = false;
							this.dingLoginToServer(code);
						}
					}
					
					// 检查是否是中转页面的消息
					if (data.type === 'dingtalk_code' && data.code) {
						console.log('从消息中获取到code:', data.code);
						this.showWebView = false;
						this.dingLoginToServer(data.code);
					}
				} catch (error) {
					console.error('处理WebView消息出错：', error);
					uni.showToast({
						title: '处理登录信息失败',
						icon: 'none'
					});
				}
			},
			// 从URL中提取code
			getCodeFromUrl(url) {
				const match = url.match(/[?&]code=([^&]+)/);
				console.log('match', match);
				return match ? match[1] : null;
			},
			// 钉钉登录获取到code后，调用服务端接口
			dingLoginToServer(authCode) {
				console.log('获取到钉钉授权码：', authCode);
				
				uni.showLoading({
					title: '登录中...'
				});
				
				// 调用后端接口，使用authCode换取用户信息
				uni.request({
					url: 'your_api_url/dingding/login',
					method: 'POST',
					data: {
						authCode: authCode
					},
					success: (res) => {
						if (res.data.code === 0) {
							// 保存token
							setToken(res.data.data.token);
							// 保存用户信息
							uni.setStorageSync('userInfo', res.data.data.userInfo);
							
							// 跳转到首页
							uni.reLaunch({
								url: '/pages/Home/index'
							});
						} else {
							uni.showToast({
								title: res.data.msg || '登录失败',
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						uni.showToast({
							title: '网络请求失败',
							icon: 'none'
						});
					},
					complete: () => {
						uni.hideLoading();
					}
				});
			},
			handleRememberPwdChange(e) {
				this.rememberPwd = e.detail.value;
			},
			// 开始检查授权状态
			startCheckAuthStatus() {
				console.log('开始检查授权状态');
				this.checkAuthTimer = setInterval(() => {
					try {
						const code = localStorage.getItem('dingtalk_code');
						if (code) {
							console.log('检测到授权码：', code);
							clearInterval(this.checkAuthTimer);
							localStorage.removeItem('dingtalk_code');
							this.dingLoginToServer(code);
						}
					} catch (error) {
						console.error('检查授权状态出错：', error);
					}
				}, 1000);
				
				// 60秒后停止检查
				setTimeout(() => {
					if (this.checkAuthTimer) {
						clearInterval(this.checkAuthTimer);
						this.checkAuthTimer = null;
						uni.showToast({
							title: '登录超时，请重试',
							icon: 'none',
							duration: 2000
						});
					}
				}, 60000);
			},
			// 在组件销毁时清理定时器
			beforeDestroy() {
				if (this.checkAuthTimer) {
					clearInterval(this.checkAuthTimer);
					this.checkAuthTimer = null;
				}
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 40rpx;
		background-color: #fff;
		min-height: 100vh;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 100rpx;
		margin-bottom: 100rpx;
	}

	.login-form {
		width: 100%;
	}

	.input-item {
		display: flex;
		align-items: center;
		border-bottom: 1px solid #eee;
		padding: 20rpx 0;
		margin-bottom: 30rpx;
	}

	.icon {
		width: 40rpx;
		height: 40rpx;
		margin-right: 20rpx;
	}

	input {
		flex: 1;
		font-size: 28rpx;
	}

	.remember-pwd {
		display: flex;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.remember-pwd text {
		font-size: 26rpx;
		color: #666;
		margin-left: 10rpx;
	}

	.login-btn {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		text-align: center;
		background-color: #ff6a00;
		color: #fff;
		border-radius: 45rpx;
		font-size: 32rpx;
		margin-bottom: 60rpx;
	}

	.other-login {
		text-align: center;
	}

	.other-login text {
		font-size: 26rpx;
		color: #999;
	}

	.other-icons {
		margin-top: 30rpx;
	}

	.other-icon {
		width: 80rpx;
		height: 80rpx;
	}
	
	/* WebView样式 */
	web-view {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 999;
		background-color: #fff;
	}
</style>
