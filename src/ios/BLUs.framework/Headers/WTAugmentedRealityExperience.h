#import <Foundation/Foundation.h>
#import <WikitudeSDK/WikitudeSDK.h>


extern NSString * const kWTAugmentedRealityExperienceStartupParameterKey_CaptureDevicePosition;
extern NSString * const kWTAugmentedRealityExperienceStartupParameterKey_CaptureDevicePosition_Back;

extern NSString * const kWTAugmentedRealityExperienceStartupParameterKey_CaptureDeviceResolution;
extern NSString * const kWTAugmentedRealityExperienceStartupParameterKey_CaptureDeviceResolution_Auto;
extern NSString * const kWTAugmentedRealityExperienceStartupParameterKey_CaptureDeviceResolution_SD_640x480;
extern NSString * const kWTAugmentedRealityExperienceStartupParameterKey_CaptureDeviceResolution_HD_1280x720;
extern NSString * const kWTAugmentedRealityExperienceStartupParameterKey_CaptureDeviceResolution_FULL_HD_1920x1080;

extern NSString * const kWTAugmentedRealityExperienceStartupParameterKey_ManualFocusDistance;


@interface WTAugmentedRealityExperience : NSObject <NSCoding>

@property (nonatomic, strong, readonly) NSString                        *title;
@property (nonatomic, strong, readonly) NSString                        *groupTitle;
@property (nonatomic, strong, readonly) NSURL                           *URL;
@property (nonatomic, assign, readonly) WTFeatures                      requiredFeatures;
@property (nonatomic, strong, readonly) NSDictionary                    *startupParameters;
@property (nonatomic, strong, readonly) NSString                        *requiredViewControllerExtension;

+ (WTAugmentedRealityExperience *)experienceWithTitle:(NSString *)title groupTitle:(NSString *)groupTitle URL:(NSURL *)URL requiredFeatures:(WTFeatures)features startupParameters:(NSDictionary *)startupParameters requiredViewControllerExtension:(NSString *)requiredViewControllerExtension;

@end
