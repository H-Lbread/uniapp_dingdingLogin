import { checkPermission } from '@/utils/auth.js'

export default {
	onLoad() {
		const pages = getCurrentPages()
		const currentPage = pages[pages.length - 1]
		const url = `/${currentPage.route}`
		
		if (!checkPermission(url)) {
			uni.redirectTo({
				url: '/pages/Login/index'
			})
		}
	},
	methods: {
		checkPermission
	}
} 