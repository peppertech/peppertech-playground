requirejs.config({
    // Path mappings for the logical module names
    paths: {
        'knockout': 'libs/knockout/knockout-min',
        'jquery': 'libs/jquery/jquery',
        'foundation': 'libs/foundation/foundation.min',
        'async': 'libs/requirejs-async/async'
    },
    // Shim configurations for modules that do not expose AMD
    shim: {
        'jquery': {
            exports: ['jQuery', '$']
        },
        'foundation': {
            deps: ['jquery']
        }
    }
});

/**
 * A top-level require call executed by the Application.
 * Although 'ojcore' and 'knockout' would be loaded in any case (they are specified as dependencies
 * by the modules themselves), we are listing them explicitly to get the references to the 'oj' and 'ko'
 * objects in the callback
 */
require(['knockout', 'jquery', 'async!http://maps.google.com/maps/api/js?sensor=false', 'foundation'],
        function (ko, $) // this callback gets executed when all required modules are loaded
        {


            function detailsViewModel() {
                var self = this;
                self.mapContainer = document.getElementById('map-container');
                self.map = new google.maps.Map(self.mapContainer, {
                    zoom: 8,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
                var geocoder = new google.maps.Geocoder();

                self.mapCenter = ko.observable();
                self.address = ko.observable('Seattle, WA');
                // Get LatLng information by name

                self.getLatLong = function () {
                    geocoder.geocode({
                        "address": self.address()
                    }, function (results, status) {
                        self.map.setCenter(results[0].geometry.location);
                    });
                };

                self.setCenter = function() {
                    self.getLatLong();
                };



            }

            detailsVM = new detailsViewModel();
            
            $(document).ready(function () {

                ko.applyBindings(detailsVM, document.getElementById('mainContent'));
                detailsVM.setCenter();

            });

        });