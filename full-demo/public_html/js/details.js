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

                self.vars = [];
                var hash;
                var q = document.URL.split('?')[1];
                if (q != undefined) {
                    q = q.split('&');
                    for (var i = 0; i < q.length; i++) {
                        hash = q[i].split('=');
                        self.vars.push(hash[1]);
                        self.vars[hash[0]] = hash[1];
                    }
                }

                self.manufacturer = [];
                self.name = ko.observable();
                self.address1 = ko.observable();
                self.address2 = ko.observable();
                self.city = ko.observable();
                self.state = ko.observable();
                self.zip = ko.observable();
                self.phone = ko.observable();
                self.email = ko.observable();
                self.rep = ko.observable();

                self.manuId = self.vars['id'];
                self.serviceURL = "http://localhost:8080/RESTFromSampleDB/webresources/com.mycompany.restfromsampledb.manufacturer/" + self.manuId;
                self.mapContainer = document.getElementById('map-container');

                var geocoder = new google.maps.Geocoder();

                self.mapAddress = ko.observable('Seattle, WA');

                // Get LatLng information by name
                self.getLatLong = function () {
                    geocoder.geocode({
                        "address": self.mapAddress()
                    }, function (results, status) {
                        var map = new google.maps.Map(self.mapContainer, {
                            center: results[0].geometry.location,
                            zoom: 10,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        });
                    });
                };

                self.setCenter = function () {
                    self.getLatLong();
                };

                self.load = function () {
                    processData("GET", self.serviceURL);
                }
            }

            function processData(method, url) {
                var self = this;
                $.ajax({
                    url: url,
                    type: method,
                    contentType: 'application/json',
                    dataType: 'json',
                    success: function (data, status, xhr) {
                        self.data = data;
                        detailsVM.name(data.name);
                        detailsVM.address1(data.addressline1);
                        detailsVM.address2(data.addressline2);
                        detailsVM.city(data.city);
                        detailsVM.state(data.state);
                        detailsVM.zip(data.zip);
                        detailsVM.phone(data.phone);
                        detailsVM.email(data.email);
                        detailsVM.rep(data.rep);
                        detailsVM.mapAddress(detailsVM.address1() + ' ' + detailsVM.city() + ', ' + detailsVM.state() + ' ' + detailsVM.zip());

                        detailsVM.setCenter();
                        $('#mainContent').show();
                    },
                    error: function (xhr, status, error) {
                        alert("Error processing data: " + status + " : " + error);
                        console.log("Error processing data: " + status + " : " + error);
                    }
                });

            }
            detailsVM = new detailsViewModel();

            $(document).ready(function () {

                ko.applyBindings(detailsVM, document.getElementById('mainContent'));
                detailsVM.load();

            });

        });