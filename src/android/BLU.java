package org.apache.cordova.blu;

import android.support.v4.app.FragmentActivity;
import com.bluairspace.sdk.helper.Blu;
import com.bluairspace.sdk.helper.data.BluDataHelper;
import com.bluairspace.sdk.model.MarkerBasedSettings;
import com.bluairspace.sdk.model.MarkerlessGroup;
import com.bluairspace.sdk.model.MarkerlessExperience;
import com.bluairspace.sdk.helper.callback.TaskCallback;
import com.bluairspace.sdk.helper.callback.DataCallback;

import java.util.*;
import java.lang.*;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import com.google.gson.Gson;

public class BLU extends CordovaPlugin {
    private Gson gson;

    public BLU() {
        this.gson = new Gson();
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        switch (action) {
            case "init":
                String key = args.getString(0);
                this.init(key, callbackContext);
                return true;
            case "getMarkerlessGroups":
                this.getMarkerlessGroups(callbackContext);
                return true;
            case "getMarkerlessExperiences":
                Integer groupId = args.getInt(0);
                this.getMarkerlessExperiences(groupId, callbackContext);
                return true;
            case "startMarkerbased":
                JSONObject settingsJSON = args.getJSONObject(0);
                MarkerBasedSettings settings = gson.fromJson(settingsJSON.toString(), MarkerBasedSettings.class);
                this.startMarkerbased(settings, callbackContext);
                return true;
            case "startMarkerless":
                List<MarkerlessExperience> markers = new ArrayList<>();
                for (int i = 0; i < args.length(); i++) {
                    JSONObject markerJSON = args.getJSONObject(i);
                    MarkerlessExperience marker = gson.fromJson(markerJSON.toString(), MarkerlessExperience.class);
                    markers.add(marker);
                }
                this.startMarkerless(markers, callbackContext);
                return true;
            default:
                break;
        }
        return false;
    }

    private void init(String key, CallbackContext callbackContext) {
        Blu.INSTANCE.init(
            cordova.getContext(), 
            key, 
            this.getTaskCallback(callbackContext)
        );
    }

    private void getMarkerlessGroups(CallbackContext callbackContext) {
        BluDataHelper.INSTANCE.getMarkerlessGroups(
            new DataCallback<MarkerlessGroup>() {
                @Override
                public void onSuccess(List<? extends MarkerlessGroup> list) {
                    callbackContext.success(gson.toJson(list));
                }
    
                @Override
                public void onFail(String errorMessage) {
                    callbackContext.error(errorMessage);
                }
            }
        );
    }

    private void getMarkerlessExperiences(Integer groupId, CallbackContext callbackContext) {
        BluDataHelper.INSTANCE.getMarkerlessExperiences(
            groupId,
            new DataCallback<MarkerlessExperience>() {
                @Override
                public void onSuccess(List<? extends MarkerlessExperience> list) {
                    callbackContext.success(gson.toJson(list));
                }
    
                @Override
                public void onFail(String errorMessage) {
                    callbackContext.error(errorMessage);
                }
            }
        );
    }

    private void startMarkerbased(MarkerBasedSettings settings, CallbackContext callbackContext) {
        Blu.INSTANCE.startMarkerbased(
            (FragmentActivity) cordova.getActivity(), 
            this.getTaskCallback(callbackContext),
            settings
        );
    }

    private void startMarkerless(List<MarkerlessExperience> markers, CallbackContext callbackContext) {
        Blu.INSTANCE.startMarkerless(
            (FragmentActivity) cordova.getActivity(),
            markers,
            this.getTaskCallback(callbackContext)
        );
    }


    private TaskCallback getTaskCallback(CallbackContext callbackContext) {
        return new TaskCallback() {
            @Override
            public void onSuccess() {
                callbackContext.success();
            }

            @Override
            public void onFail(String errorMessage) {
                callbackContext.error(errorMessage);
            }
        };
    }
}
