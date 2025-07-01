package com.dingtalk.android;

import android.app.Activity;
import com.alibaba.fastjson.JSONObject;
import com.android.dingtalk.share.ddsharemodule.DDShareApiFactory;
import com.android.dingtalk.share.ddsharemodule.IDDShareApi;
import com.android.dingtalk.share.ddsharemodule.message.DDMediaMessage;
import com.android.dingtalk.share.ddsharemodule.message.SendAuth;
import io.dcloud.feature.uniapp.annotation.UniJSMethod;
import io.dcloud.feature.uniapp.bridge.UniJSCallback;
import io.dcloud.feature.uniapp.common.UniModule;

public class DingTalkLoginPlugin extends UniModule {
    private IDDShareApi ddShareApi;
    
    @UniJSMethod(uiThread = true)
    public void login(UniJSCallback callback) {
        Activity activity = mUniSDKInstance.getContext();
        if (activity == null) {
            JSONObject result = new JSONObject();
            result.put("code", -1);
            result.put("message", "activity is null");
            callback.invoke(result);
            return;
        }

        ddShareApi = DDShareApiFactory.createDDShareApi(activity, "ef1adba3-8bd1-40a1-8162-1ed1d8da9251", false);
        
        SendAuth.Req req = new SendAuth.Req();
        req.scope = "snsapi_auth";
        req.state = "state";
        
        boolean sent = ddShareApi.sendReq(req);
        
        if (!sent) {
            JSONObject result = new JSONObject();
            result.put("code", -1);
            result.put("message", "send auth request failed");
            callback.invoke(result);
        }
    }
    
    @UniJSMethod(uiThread = true)
    public void handleResponse(String code, UniJSCallback callback) {
        if (code != null && !code.isEmpty()) {
            JSONObject result = new JSONObject();
            result.put("code", 0);
            result.put("data", code);
            callback.invoke(result);
        } else {
            JSONObject result = new JSONObject();
            result.put("code", -1);
            result.put("message", "auth failed");
            callback.invoke(result);
        }
    }
} 