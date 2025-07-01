<template>
	<view class="content">
		<text>首页</text>
		<button @click="handleLogout">退出登录</button>
	</view>
</template>

<script>
	import authMixin from '@/mixins/auth.js'
	import { removeToken } from '@/utils/auth.js'
	
	export default {
		mixins: [authMixin],
		data() {
			return {
				
			}
		},
		methods: {
			handleLogout() {
				// 清除token和用户信息
				removeToken()
				uni.removeStorageSync('userInfo')
				
				// 跳转到登录页
				uni.reLaunch({
					url: '/pages/Login/index'
				})
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}
</style>