#import <UIKit/UIKit.h>
#import <WikitudeSDK/WikitudeSDK.h>



@interface WTAugmentedRealityViewController : UIViewController <WTArchitectViewDelegate, UIGestureRecognizerDelegate>

@property (nonatomic, weak) IBOutlet WTArchitectView *architectView;
@property (nonatomic, assign) BOOL isProofing;

- (void)onReceivedActionDismiss;
- (void)onMarkerRecognized: (int) markerId;

- (void)onReceivedButtonActionPhone: (NSString *) phone;
- (void)onReceivedButtonActionEmail: (NSString *) email subject: (NSString *)subject;
- (void)onReceivedButtonActionOpenExternalUrl: (NSString *) urlString;
- (void)onReceivedButtonActionCalendarWithTitle:(NSString *)theTitle :(NSString *)startDate :(NSString *)endDate :(NSString *)description;
- (void)onReceivedButtonActionVCardWithName:(NSString *)name
                                           :(NSString *)company
                                           :(NSString *)title
                                           :(NSString *)phoneType
                                           :(NSString *)phone
                                           :(NSString *)emailType
                                           :(NSString *)email;

@end



