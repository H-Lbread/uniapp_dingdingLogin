<template>
	<view class="webview-container">
		<web-view :src="url" @message="handleMessage"></web-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			url: ''
		}
	},
	onLoad(options) {
		if (options.url) {
			this.url = decodeURIComponent(options.url);
			console.log('加载URL:', this.url);
		}
		
		// 监听页面消息
		uni.$on('auth_success', this.handleAuthSuccess);
	},
	onUnload() {
		// 移除事件监听
		uni.$off('auth_success', this.handleAuthSuccess);
	},
	methods: {
		// 处理WebView消息
		handleMessage(event) {
			console.log('收到WebView消息:', event);
			const data = event.detail;
			
			// 处理授权成功的消息
			if (data.type === 'auth_success' && data.code) {
				this.handleAuthSuccess(data.code);
			}
		},
		
		// 处理授权成功
		handleAuthSuccess(code) {
			console.log('授权成功，code:', code);
			
			// 关闭WebView
			uni.navigateBack();
			
			// 调用登录接口
			const loginPage = getApp().globalData.loginPage;
			if (loginPage) {
				loginPage.dingLoginToServer(code);
			}
		}
	}
}
</script>

<style>
.webview-container {
	width: 100%;
	height: 100vh;
}
</style> 