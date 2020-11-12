package org.apache.cordova.blu;

import androidx.fragment.app.FragmentActivity;

import com.bluairspace.sdk.helper.Blu;
import com.bluairspace.sdk.helper.BluDataHelper;
import com.bluairspace.sdk.model.MarkerbasedMarker;
import com.bluairspace.sdk.model.MarkerBasedSettings;
import com.bluairspace.sdk.model.MarkerlessGroup;
import com.bluairspace.sdk.model.MarkerlessExperience;

import java.util.*;
import java.lang.*;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;

import org.jetbrains.annotations.NotNull;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.bluairspace.sdk.model.callback.DataCallback;
import com.bluairspace.sdk.model.callback.TaskCallback;
import com.bluairspace.sdk.model.exception.BluairspaceSdkException;
import com.bluairspace.sdk.util.publicutil.PermissionUtil;
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
        case "getMarkerbasedMarkers":
            this.getMarkerbasedMarkers(callbackContext);
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

    private void getMarkerbasedMarkers(CallbackContext callbackContext) {
        BluDataHelper.INSTANCE.getMarkerbasedMarkers(new DataCallback<MarkerbasedMarker>() {

            @Override
            public void onFail(@NotNull BluairspaceSdkException e) {
                callbackContext.error(e.getMessage());
            }

            @Override
            public void onProgress(int i, int i1) {

            }

            @Override
            public void onSuccess(@NotNull List<? extends MarkerbasedMarker> list) {
                callbackContext.success(gson.toJson(list));
            }
        });
    }

    private void getMarkerlessGroups(CallbackContext callbackContext) {
        BluDataHelper.INSTANCE.getMarkerlessGroups(
            new DataCallback<MarkerlessGroup>() {
                @Override
                public void onFail(@NotNull BluairspaceSdkException e) {
                    callbackContext.error(e.getMessage());
                }

                @Override
                public void onProgress(int i, int i1) {

                }

                @Override
                public void onSuccess(@NotNull List<? extends MarkerlessGroup> list) {
                    callbackContext.success(gson.toJson(list));
                }
            }
        );
    }

    private void getMarkerlessExperiences(Integer groupId, CallbackContext callbackContext) {
        BluDataHelper.INSTANCE.getMarkerlessExperiences(
            groupId,
            new DataCallback<MarkerlessExperience>() {
                @Override
                public void onFail(@NotNull BluairspaceSdkException e) {
                    callbackContext.error(e.getMessage());
                }

                @Override
                public void onProgress(int i, int i1) {

                }

                @Override
                public void onSuccess(@NotNull List<? extends MarkerlessExperience> list) {
                    callbackContext.success(gson.toJson(list));
                }
            }
        );
    }

    private void startMarkerbased(MarkerBasedSettings settings, CallbackContext callbackContext) {
        if (!PermissionUtil.INSTANCE.isPermissionsGranted(cordova.getContext())) {
            PermissionUtil.INSTANCE.askPermission((FragmentActivity) cordova.getActivity());
            return;
        }
        Blu.INSTANCE.startMarkerbased(
            (FragmentActivity) cordova.getActivity(),
            this.getTaskCallback(callbackContext),
            settings
        );
    }

    private void startMarkerless(List<MarkerlessExperience> markers, CallbackContext callbackContext) {
        if (!PermissionUtil.INSTANCE.isPermissionsGranted(cordova.getContext())) {
            PermissionUtil.INSTANCE.askPermission((FragmentActivity) cordova.getActivity());
            return;
        }
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
            public void onFail(BluairspaceSdkException e) {
                callbackContext.error(e.getMessage());
            }

            @Override
            public void onProgress(int i, int i1) {

            }
        };
    }
}
