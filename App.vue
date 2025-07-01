<script>
	import { checkPermission } from './utils/auth.js'

	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		// 全局路由守卫
		onPageNotFound(msg) {
			uni.redirectTo({
				url: '/pages/Login/index'
			})
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
