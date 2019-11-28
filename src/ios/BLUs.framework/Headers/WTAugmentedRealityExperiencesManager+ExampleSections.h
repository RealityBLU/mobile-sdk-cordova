#import "WTAugmentedRealityExperiencesManager.h"


typedef void(^WTAugmentedRealityExperiencesLoadCompletionHandler)(NSUInteger numberOfExperienceCategories);


@class L;

@interface WTAugmentedRealityExperiencesManager (ExampleSections)

- (void)loadARExperience:(WTAugmentedRealityExperiencesLoadCompletionHandler)completionHandler scanCameraPositionBack:(BOOL)campos;
- (void)loadScanExperience:(BOOL)scanCameraPositionBack;
- (void)loadMarkerlessExperience;

- (BOOL)hasLoadedAugmentedRealityExperiencesFromPlist;

@end
