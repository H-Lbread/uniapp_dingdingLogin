<template>
	<view class="auth-page">
		<text>正在处理钉钉登录...</text>
	</view>
</template>

<script>
export default {
	data() {
		return {}
	},
	onLoad(options) {
		// 获取URL中的授权码
		const code = options.code || '';
		if (code) {
			console.log('收到钉钉授权码:', code);
			this.handleDingTalkAuth(code);
		} else {
			console.error('未收到钉钉授权码');
			this.handleAuthError();
		}
	},
	methods: {
		// 处理钉钉授权
		async handleDingTalkAuth(code) {
			try {
				// 调用登录接口
				const loginResult = await this.dingLoginToServer(code);
				
				if (loginResult.success) {
					uni.showToast({
						title: '登录成功',
						icon: 'success'
					});
					
					// 跳转到首页
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/Home/index'
						});
					}, 1500);
				} else {
					throw new Error(loginResult.message || '登录失败');
				}
			} catch (error) {
				console.error('处理钉钉授权失败:', error);
				this.handleAuthError(error.message);
			}
		},
		
		// 处理授权错误
		handleAuthError(message = '登录失败，请重试') {
			uni.showToast({
				title: message,
				icon: 'none'
			});
			
			// 返回登录页
			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/Login/index'
				});
			}, 2000);
		},
		
		// 调用服务端登录接口
		dingLoginToServer(code) {
			return new Promise((resolve, reject) => {
				uni.request({
					url: 'http://your-api-domain/api/dingtalk/login',
					method: 'POST',
					data: {
						code: code
					},
					success: (res) => {
						if (res.data && res.data.token) {
							// 保存登录信息
							uni.setStorageSync('token', res.data.token);
							uni.setStorageSync('userInfo', res.data.userInfo);
							resolve({
								success: true,
								data: res.data
							});
						} else {
							resolve({
								success: false,
								message: res.data.message || '登录失败'
							});
						}
					},
					fail: (err) => {
						reject(err);
					}
				});
			});
		}
	}
}
</script>

<style>
.auth-page {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
}
</style> 