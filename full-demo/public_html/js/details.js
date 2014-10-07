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
require(['knockout', 'jquery', 'foundation'],
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
                
                // The serviceHost variable is being set dynamically to allow for easier testing. 
                // you will probably want to set this to a static value once you are in production
                self.serviceHost = window.location.protocol+"//"+window.location.hostname;
                self.mapAddressURL = ko.observable(); //https://www.google.com/maps/@40.7056308,-73.9780035,10z
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
                
                // The serviceURL will vary depending on what you named your REST service
                // If you find you are getting 404 errors returned from your REST calls, this is probably the place to fix it.
                self.serviceURL = self.serviceHost+":8080/RESTFromSampleDB/webresources/com.mycompany.restfromsampledb.manufacturer/" + self.manuId;
                self.mapAddress = ko.observable();

                self.load = function () {
                    processData("GET", self.serviceURL);
                };
            }

            function processData(method, url) {
                $.ajax({
                    url: url,
                    type: method,
                    contentType: 'application/json',
                    dataType: 'json',
                    success: function (data, status, xhr) {
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
                $(document).foundation();
                detailsVM.load();
            });

        });