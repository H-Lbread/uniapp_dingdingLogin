if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const whiteList = [
    "/pages/Login/index"
    // '/pages/Home/index',
  ];
  function getToken() {
    return uni.getStorageSync("token");
  }
  function setToken(token) {
    uni.setStorageSync("token", token);
  }
  function removeToken() {
    uni.removeStorageSync("token");
  }
  function checkPermission(url) {
    if (whiteList.indexOf(url) !== -1) {
      return true;
    }
    if (getToken()) {
      return true;
    }
    return false;
  }
  const _imports_0 = "/static/login/logo.png";
  const _imports_1 = "/static/login/user.png";
  const _imports_2 = "/static/login/password.png";
  const _imports_3 = "/static/login/dingding.png";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$2 = {
    data() {
      var _a;
      const currentUrl = ((_a = window == null ? void 0 : window.location) == null ? void 0 : _a.href) || "";
      currentUrl.includes("localhost") || currentUrl.includes("127.0.0.1");
      const serverIP = "192.168.6.91:3000";
      return {
        username: "",
        password: "",
        rememberPwd: false,
        showWebView: false,
        dingdingUrl: "",
        dingConfig: {
          appId: "dingkvjzimyeiodlxmcq",
          // 替换为您在钉钉开放平台创建的应用的AppKey
          redirectUri: encodeURIComponent(`http://${serverIP}/dingtalk/callback`)
        }
      };
    },
    onLoad(options) {
      if (getToken()) {
        uni.reLaunch({
          url: "/pages/Home/index"
        });
        return;
      }
    },
    methods: {
      handleLogin() {
        if (!this.username || !this.password) {
          uni.showToast({
            title: "请输入账号和密码",
            icon: "none"
          });
          return;
        }
        uni.showLoading({
          title: "登录中..."
        });
        uni.request({
          url: "your_api_url/login",
          method: "POST",
          data: {
            username: this.username,
            password: this.password
          },
          success: (res) => {
            if (res.data.code === 0) {
              setToken(res.data.data.token);
              uni.setStorageSync("userInfo", res.data.data.userInfo);
              uni.reLaunch({
                url: "/pages/Home/index"
              });
            } else {
              uni.showToast({
                title: res.data.msg || "登录失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          },
          complete: () => {
            uni.hideLoading();
          }
        });
      },
      // 处理钉钉登录
      handleDingDingLogin() {
        uni.showToast({
          title: "正在打开钉钉登录",
          icon: "none",
          duration: 2e3
        });
        formatAppLog("log", "at pages/Login/index.vue:135", "点击钉钉登录按钮");
        formatAppLog("log", "at pages/Login/index.vue:143", "APP环境，执行APP登录");
        uni.showLoading({
          title: "正在打开钉钉..."
        });
        try {
          const authUrl = `https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${this.dingConfig.appId}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=${this.dingConfig.redirectUri}`;
          formatAppLog("log", "at pages/Login/index.vue:153", "授权URL:", authUrl);
          plus.runtime.openURL(authUrl, (err) => {
            if (err) {
              formatAppLog("error", "at pages/Login/index.vue:158", "打开浏览器失败：", err);
              this.dingdingUrl = authUrl;
              this.showWebView = true;
            }
            uni.hideLoading();
          });
          setTimeout(() => {
            uni.hideLoading();
          }, 5e3);
        } catch (error) {
          formatAppLog("error", "at pages/Login/index.vue:172", "打开钉钉登录出错：", error);
          uni.hideLoading();
          uni.showToast({
            title: "打开钉钉失败，请重试",
            icon: "none",
            duration: 2e3
          });
        }
      },
      // H5端钉钉登录
      dingdingH5Login() {
        const url = `https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${this.dingConfig.appId}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=${this.dingConfig.redirectUri}`;
        formatAppLog("log", "at pages/Login/index.vue:185", "H5钉钉登录URL:", url);
        window.location.href = url;
      },
      // 处理WebView消息
      handleWebViewMessage(event) {
        formatAppLog("log", "at pages/Login/index.vue:190", "收到WebView消息：", event);
        try {
          const { data } = event;
          if (data.url && data.url.includes("code=")) {
            formatAppLog("log", "at pages/Login/index.vue:197", "从URL中检测到code");
            const code = this.getCodeFromUrl(data.url);
            if (code) {
              formatAppLog("log", "at pages/Login/index.vue:200", "成功获取到code:", code);
              this.showWebView = false;
              this.dingLoginToServer(code);
            }
          }
          if (data.type === "dingtalk_code" && data.code) {
            formatAppLog("log", "at pages/Login/index.vue:208", "从消息中获取到code:", data.code);
            this.showWebView = false;
            this.dingLoginToServer(data.code);
          }
        } catch (error) {
          formatAppLog("error", "at pages/Login/index.vue:213", "处理WebView消息出错：", error);
          uni.showToast({
            title: "处理登录信息失败",
            icon: "none"
          });
        }
      },
      // 从URL中提取code
      getCodeFromUrl(url) {
        const match = url.match(/[?&]code=([^&]+)/);
        return match ? match[1] : null;
      },
      // 钉钉登录获取到code后，调用服务端接口
      dingLoginToServer(authCode) {
        formatAppLog("log", "at pages/Login/index.vue:227", "获取到钉钉授权码：", authCode);
        uni.showLoading({
          title: "登录中..."
        });
        uni.request({
          url: "your_api_url/dingding/login",
          method: "POST",
          data: {
            authCode
          },
          success: (res) => {
            if (res.data.code === 0) {
              setToken(res.data.data.token);
              uni.setStorageSync("userInfo", res.data.data.userInfo);
              uni.reLaunch({
                url: "/pages/Home/index"
              });
            } else {
              uni.showToast({
                title: res.data.msg || "登录失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            uni.showToast({
              title: "网络请求失败",
              icon: "none"
            });
          },
          complete: () => {
            uni.hideLoading();
          }
        });
      },
      handleRememberPwdChange(e) {
        this.rememberPwd = e.detail.value;
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createElementVNode("image", {
        class: "logo",
        src: _imports_0
      }),
      vue.createElementVNode("view", { class: "login-form" }, [
        vue.createElementVNode("view", { class: "input-item" }, [
          vue.createElementVNode("image", {
            class: "icon",
            src: _imports_1
          }),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.username = $event),
              placeholder: "请输入账号"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.username]
          ])
        ]),
        vue.createElementVNode("view", { class: "input-item" }, [
          vue.createElementVNode("image", {
            class: "icon",
            src: _imports_2
          }),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "password",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.password = $event),
              placeholder: "请输入密码"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.password]
          ])
        ]),
        vue.createElementVNode("view", { class: "remember-pwd" }, [
          vue.createElementVNode("checkbox", {
            checked: $data.rememberPwd,
            onChange: _cache[2] || (_cache[2] = (...args) => $options.handleRememberPwdChange && $options.handleRememberPwdChange(...args)),
            color: "#ff6a00"
          }, null, 40, ["checked"]),
          vue.createElementVNode("text", null, "记住密码")
        ]),
        vue.createElementVNode("button", {
          class: "login-btn",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.handleLogin && $options.handleLogin(...args))
        }, "登录"),
        vue.createElementVNode("view", { class: "other-login" }, [
          vue.createElementVNode("text", null, "其他方式登录"),
          vue.createElementVNode("view", { class: "other-icons" }, [
            vue.createElementVNode("image", {
              class: "other-icon",
              src: _imports_3,
              onClick: _cache[4] || (_cache[4] = (...args) => $options.handleDingDingLogin && $options.handleDingDingLogin(...args))
            })
          ])
        ])
      ]),
      vue.createCommentVNode(" 添加WebView组件 "),
      $data.showWebView ? (vue.openBlock(), vue.createElementBlock("web-view", {
        key: 0,
        src: $data.dingdingUrl,
        onMessage: _cache[5] || (_cache[5] = (...args) => $options.handleWebViewMessage && $options.handleWebViewMessage(...args))
      }, null, 40, ["src"])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesLoginIndex = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "C:/Users/高/Documents/HBuilderProjects/奥凯/pages/Login/index.vue"]]);
  const authMixin = {
    onLoad() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const url = `/${currentPage.route}`;
      if (!checkPermission(url)) {
        uni.redirectTo({
          url: "/pages/Login/index"
        });
      }
    }
  };
  const _sfc_main$1 = {
    mixins: [authMixin],
    data() {
      return {};
    },
    methods: {
      handleLogout() {
        removeToken();
        uni.removeStorageSync("userInfo");
        uni.reLaunch({
          url: "/pages/Login/index"
        });
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "content" }, [
      vue.createElementVNode("text", null, "首页"),
      vue.createElementVNode("button", {
        onClick: _cache[0] || (_cache[0] = (...args) => $options.handleLogout && $options.handleLogout(...args))
      }, "退出登录")
    ]);
  }
  const PagesHomeIndex = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__file", "C:/Users/高/Documents/HBuilderProjects/奥凯/pages/Home/index.vue"]]);
  __definePage("pages/Login/index", PagesLoginIndex);
  __definePage("pages/Home/index", PagesHomeIndex);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:6", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:9", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:12", "App Hide");
    },
    // 全局路由守卫
    onPageNotFound(msg) {
      uni.redirectTo({
        url: "/pages/Login/index"
      });
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/高/Documents/HBuilderProjects/奥凯/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
