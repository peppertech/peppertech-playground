/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
MyCustomerViewModel = function () {
    var self = this;
    self.serviceURL = "http://localhost:8080/RESTFromSampleDB/webresources/com.mycompany.restfromsampledb.manufacturer";
    self.manufacturers = ko.observableArray([]);
    self.data = [];
    self.showEdit = ko.observable(false);

    self.loadTable = function () {
        processData("GET", self.serviceURL);
    };

    self.addRow = function (ev) {
        self.showEdit(true);
        editVM.buttonName('Submit');
    };

    self.deleteRow = function (data, ev) {
        console.log("Delete Clicked");
        var url = self.serviceURL + "/" + data.id();
        processData("DELETE", url);
    };
};

function editViewModel() {
    var self = this;
    self.buttonName = ko.observable('Submit');
    self.showEdit = dataVM.showEdit();
    self.url = dataVM.serviceURL;
    self.name = ko.observable();
    self.address = ko.observable();
    self.city = ko.observable();
    self.state = ko.observable();

    self.openEdit = function (data) {
        self.buttonName('Update');
        self.id = data.id();
        self.name(data.name());
        self.address(data.address());
        self.city(data.city());
        self.state(data.state());
        dataVM.showEdit(true);
    };

    self.editRow = function (form) {
        var url = self.url + "/" + self.id;
        self.name(form[0].value);
        self.city(form[1].value);
        self.state(form[2].value);
        var jsonData = '[{"customerId":"' + self.id + '","name":"' + self.name() + '","addressline1":"' + self.address() + '","city":"' + self.city() + '","state":"' + self.state() + '"}]';
        console.log(jsonData);
        processData("PUT", url, jsonData);
    };

    self.addRow = function (data) {
        self.buttonName('Submit');
        self.id = null;
        self.name(data[0].value);
        self.city(data[1].value);
        self.state(data[2].value);
        var jsonData = '[{"name":"' + self.name() + '","addressline1":"' + self.address() + '","city":"' + self.city() + '","state":"' + self.state() + '"}]';
        console.log(jsonData);
        processData("POST", self.url, jsonData);
    };

    self.takeAction = function (form) {
        // If we have an existing ID, then treat it as an edit. Otherwise add a new row
        if (self.id) {
            self.editRow(form);
        } else {
            self.addRow(form);
        }
        dataVM.showEdit(false);
    };

}

function processData(method, url, newData) {
    var self = this;
    if (!newData)
        newData = "";
    $.ajax({
        url: url,
        type: method,
        contentType: 'application/json',
        dataType: 'json',
        data: newData,
        success: function (data,status,xhr) {
            self.data = data;
            
            // If we are returning a success, and there is no content, then it's probably a delete method, so just clear and reload the table.
            if(status === "nocontent"){
                dataVM.manufacturers([]);
                dataVM.loadTable();
                return true;
            }
            //If we get something back, update the observable that builds the table
            if (self.data.length > 0) {
                $.each(self.data, function () {
                    dataVM.manufacturers.push({
                        id: ko.observable(this.manufacturerId),
                        name: ko.observable(this.name),
                        address: ko.observable(this.addressline1),
                        city: ko.observable(this.city),
                        state: ko.observable(this.state)
                    });
                });               
            }
            $('#mainContainer').show();
        },
        error: function (xhr, status, error) {
            alert("Error processing data: " + status + " : " + error);
            console.log("Error processing data: " + status + " : " + error);
        }
    });
}

var dataVM = new MyCustomerViewModel();
var editVM = new editViewModel();

$(document).ready(function () {
    ko.applyBindings(dataVM, document.getElementById('dataSection'));
    ko.applyBindings(editVM, document.getElementById('editSection'));
    dataVM.loadTable();
    
});

