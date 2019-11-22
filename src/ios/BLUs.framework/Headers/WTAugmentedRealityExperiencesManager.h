#import <UIKit/UIKit.h>


@class WTAugmentedRealityExperience;

@interface WTAugmentedRealityExperiencesManager : NSObject

- (BOOL)addAugmentedRealityExperience:(WTAugmentedRealityExperience *)experience inSection:(NSUInteger)section moveToTop:(BOOL)moveToTop;
- (BOOL)removeAugmentedRealityExperienceAtIndexPath:(NSIndexPath *)indexPath;
- (void)replaceAugmentedRealityExperience:(WTAugmentedRealityExperience *)experience atIndexPath:(NSIndexPath *)indexPath;

- (WTAugmentedRealityExperience *)augmentedRealityExperienceForIndexPath:(NSIndexPath *)indexPath;
- (WTAugmentedRealityExperience *)augmentedRealityExperienceForPosition:(int)position;

- (NSUInteger)numberOfSections;
- (NSInteger)numberOfExperiencesInSection:(NSInteger)section;

@end

@interface WTAugmentedRealityExperiencesManager (ObjectPersitence)

- (BOOL)saveAugmentedRealityExperiencesToDisk;
- (void)loadAugmentedRealityExperiencesFromDisk;

@end
