#import "DingTalkLoginPlugin.h"
#import <DTShareKit/DTOpenKit.h>

@implementation DingTalkLoginPlugin

- (void)login:(NSDictionary *)options callback:(UniModuleCallback)callback
{
    DTOpenAPI *api = [DTOpenAPI sharedInstance];
    [api registerApp:@"ef1adba3-8bd1-40a1-8162-1ed1d8da9251"];
    
    DTAuthorizeReq *req = [[DTAuthorizeReq alloc] init];
    req.scope = @"snsapi_auth";
    req.state = @"state";
    
    BOOL sent = [api sendReq:req];
    
    if (!sent) {
        callback(@{@"code": @(-1), @"message": @"send auth request failed"}, NO);
    }
}

- (void)handleResponse:(NSString *)code callback:(UniModuleCallback)callback
{
    if (code && code.length > 0) {
        callback(@{@"code": @(0), @"data": code}, NO);
    } else {
        callback(@{@"code": @(-1), @"message": @"auth failed"}, NO);
    }
}

@end