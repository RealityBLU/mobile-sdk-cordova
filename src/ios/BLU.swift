import BLUs
import UIKit
import AVFoundation

@objc(BLU) class BLUPlugin: CDVPlugin {
    @objc(init:)
    func initialize(command: CDVInvokedUrlCommand) {
        AVCaptureDevice.requestAccess(for: AVMediaType.video) { response in }

        let key = command.arguments[0] as! String

        BLU.initialize(key) { (error) in
            if let _error = error {
                self.commandDelegate!.send(
                    CDVPluginResult(
                        status: CDVCommandStatus_ERROR,
                        messageAs: _error.description
                    ),
                    callbackId: command.callbackId
                )
            } else {
                self.commandDelegate!.send(
                        CDVPluginResult(
                            status: CDVCommandStatus_OK
                        ),
                        callbackId: command.callbackId
                    )
                }
        }
    }

    @objc(getMarkerbasedMarkers:)
    func getMarkerbasedMarkers(command: CDVInvokedUrlCommand) {
        BLUDataHelper.getMarkerbasedMarkers(){ (markers)  in
            let encoder = JSONEncoder()

            do {
                let markersJSON = try encoder.encode(markers)
               
                self.commandDelegate!.send(
                    CDVPluginResult(
                        status: CDVCommandStatus_OK,
                        messageAs: String(data: markersJSON, encoding: .utf8)!
                    ),
                    callbackId: command.callbackId
                )
                
            } catch {
                self.commandDelegate!.send(
                    CDVPluginResult(
                        status: CDVCommandStatus_OK,
                        messageAs: "[]"
                    ),
                    callbackId: command.callbackId
                )
            }
        }
    }

    @objc(getMarkerlessGroups:)
    func getMarkerlessGroups(command: CDVInvokedUrlCommand) {
        BLUDataHelper.getMarkerlessGroups(){ (groups)  in
            let encoder = JSONEncoder()

            do {
                let groupsJSON = try encoder.encode(groups)
               
                self.commandDelegate!.send(
                    CDVPluginResult(
                        status: CDVCommandStatus_OK,
                        messageAs: String(data: groupsJSON, encoding: .utf8)!
                    ),
                    callbackId: command.callbackId
                )
                
            } catch {
                self.commandDelegate!.send(
                    CDVPluginResult(
                        status: CDVCommandStatus_OK,
                        messageAs: "[]"
                    ),
                    callbackId: command.callbackId
                )
            }
        }
    }

    @objc(getMarkerlessExperiences:)
    func getMarkerlessExperiences(command: CDVInvokedUrlCommand) {
        guard let groupIdString = command.arguments[0] as? String else { return }
        guard let groupId = Int(groupIdString) else { return }

        BLUDataHelper.getMarkerlessExperiences(groupId: groupId){ (experiences) in
             let encoder = JSONEncoder()

            do {
                let experiencesJSON = try encoder.encode(experiences)
                
                self.commandDelegate!.send(
                    CDVPluginResult(
                        status: CDVCommandStatus_OK,
                        messageAs: String(data: experiencesJSON, encoding: .utf8)!
                    ),
                    callbackId: command.callbackId
                )
            } catch {
                self.commandDelegate!.send(
                    CDVPluginResult(
                        status: CDVCommandStatus_OK,
                        messageAs: "[]"
                    ),
                    callbackId: command.callbackId
                )
            }
        }
    }
    
    @objc(startMarkerbased:)
    func startMarkerbased(command: CDVInvokedUrlCommand) {
        var options = MarkerbasedOptions(enableProofing: false)
        
        if let settings = command.arguments?[0] as? [String:Any] {
            let isProofingEnabled: Bool = settings["isProofingEnabled"] as! Bool
            options.proofingEnabled = isProofingEnabled;
        }

        BLU.prepareMarkerbased(withOptions: options){ (controller, error)  in
            if let _error = error {
                self.commandDelegate!.send(
                    CDVPluginResult(
                        status: CDVCommandStatus_ERROR,
                        messageAs: _error.description
                    ),
                    callbackId: command.callbackId
                )
            } else {
                self.viewController.present(controller!, animated: true, completion: nil)
               
                self.commandDelegate!.send(
                    CDVPluginResult(
                        status: CDVCommandStatus_OK
                    ),
                    callbackId: command.callbackId
                )
            }
        }
    }

    @objc(startMarkerless:)
    func startMarkerless(command: CDVInvokedUrlCommand) {
        guard let markersRaw = command.arguments as NSArray?,
            markersRaw.count > 0 else { return }

        do {
            let rawData = try JSONSerialization.data(withJSONObject: markersRaw, options: .prettyPrinted)
            let experiences = try JSONDecoder().decode([MarkerlessExperience].self, from: rawData)

            BLU.prepareMarkerlessExperiences(experiences) { (controller, error) in
                if let _error = error {
                    self.commandDelegate!.send(
                        CDVPluginResult(
                            status: CDVCommandStatus_ERROR,
                            messageAs: _error.description
                        ),
                        callbackId: command.callbackId
                    )
                } else {
                    self.viewController.present(controller!, animated: true, completion: nil)

                    self.commandDelegate!.send(
                        CDVPluginResult(
                            status: CDVCommandStatus_OK
                        ),
                        callbackId: command.callbackId
                    )
                }
            }
        } catch let error {
            self.commandDelegate!.send(
                CDVPluginResult(
                    status: CDVCommandStatus_ERROR,
                    messageAs: error.localizedDescription
                ),
                callbackId: command.callbackId
            )
        }
    }
}
