// 白名单路径
const whiteList = [
	'/pages/Login/index',
	// '/pages/Home/index',
]

// 获取token
export function getToken() {
	return uni.getStorageSync('token')
}

// 设置token
export function setToken(token) {
	uni.setStorageSync('token', token)
}

// 移除token
export function removeToken() {
	uni.removeStorageSync('token')
}

// 检查是否需要登录
export function checkPermission(url) {
	// 在白名单中直接通过
	// if (whiteList.indexOf(url) !== -1) {
	// 	return true
	// }
	// // 有token就通过
	// if (getToken()) {
	// 	return true
	// }
	// // 其他情况都需要登录
	// return false
	
	return true
} 