/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    allMarkers: [],
    selectedMarkers: [],
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        document.querySelector('#InitButton').addEventListener('click', () => {
            let key = document.querySelector('#InitKey').value;
            blu.init(key, () => {
                alert('done');
                setupMarkerlessGroupsList();
                setupMarkerbasedMarkersList();
            }, () => {
                alert('error')
            })

            window.plugins.Permission.request('android.permission.CAMERA', (results) => {
                if (results['android.permission.CAMERA']) {
                }
            }, (error) => {
                alert(error);
            });
        });

        document.querySelector('#StartMarkerbasedButton').addEventListener('click', () => {
            let settings = {
                isSingleScanEnabled: document.querySelector('#SingleScan').checked || false, 
                isProofingEnabled: document.querySelector('#Proofing').checked || false, 
            }
            
            blu.startMarkerbased(settings, () => console.log('done'), () => alert('error'));
        });

        document.querySelector('#StartMarkerlessButton').addEventListener('click', () => {
            blu.startMarkerless(app.selectedMarkers , () => console.log('done'), () => alert('error'));
        });

        document.querySelector('#MarkerlessGroupsList').addEventListener('change', function() {
            const listId = +this.value;
            setupMarkersList(listId);
        });

        document.querySelector('#MarkersList').addEventListener('change', function() {
            const selected = this.querySelectorAll('option:checked');
            const values = Array.from(selected).map(el => el.value);
            app.selectedMarkers = app.allMarkers.filter((marker) => {
                return values.includes(marker.id + '');
            })
        });

        function setupMarkerbasedMarkersList() {
            blu.getMarkerbasedMarkers((markers) => {
                console.log('getMarkerbasedMarkers', markers);

                var markersList = document.querySelector('#MarkerbasedMarkersList');
                markersList.innerHTML = '';

                let emptyItem = document.createElement('option');
                emptyItem.innerText = 'Select marker';
                markersList.appendChild(emptyItem);

                markers.forEach((group) => {
                    let item = document.createElement('option');
                    item.value = group.id;
                    item.innerText = group.title;
                    markersList.appendChild(item);
                });
            }, (error) => {
                console.log(error);
            })
        }

        function setupMarkerlessGroupsList() {
            blu.getMarkerlessGroups((groups) => {
                console.log('getMarkerlessGroups', groups);

                var groupsList = document.querySelector('#MarkerlessGroupsList');
                groupsList.innerHTML = '';

                let emptyItem = document.createElement('option');
                emptyItem.innerText = 'Select group';
                groupsList.appendChild(emptyItem);

                groups.forEach((group) => {
                    let item = document.createElement('option');
                    item.value = group.id;
                    item.innerText = group.name;
                    groupsList.appendChild(item);
                });
            }, (error) => {
                console.log(error);
            })
        }

        function setupMarkersList(listId) {
            blu.getMarkerlessExperiences(listId, (markers) => {
                console.log('getMarkerlessExperiences', markers);
                app.allMarkers = markers

                var markersList = document.querySelector('#MarkersList');
                markersList.innerHTML = '';

                app.allMarkers.forEach((marker) => {
                    let item = document.createElement('option');
                    item.value = marker.id;
                    item.innerText = marker.name;
                    markersList.appendChild(item);
                });

            }, (error) => {
                console.log(error);
            })
        }
    },
};

app.initialize();
