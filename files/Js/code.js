//https://scotch.io/tutorials/single-page-apps-with-angularjs-routing-and-templating

var app = angular.module('myApp', []);

app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    },
      removeAllListeners: function (eventName, callback) {
          socket.removeAllListeners(eventName, function() {
              var args = arguments;
              $rootScope.$apply(function () {
                callback.apply(socket, args);
              });
          }); 
      }
  };
});

app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                        });
                }
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);



//defines the rules and data available to the web page
//more efficient use of the server
app.controller('data_get', function($scope, $http, socket){
$http.get('/DB/').success(function(data){$scope.x=data;});
    $scope.Card = function(v_id){socket.emit('get_Card', v_id)};
    socket.on('cardRet', function(Card){
        $scope.img = Card;
        $('#cardView').modal('show');
    });
});

app.controller('data_set', function($scope, $http, socket){
/*$scope.checkIn = function(Item){socket.emit('check_In', Item)};
$scope.checkOut = function(Item){socket.emit('check_Out', Item)};*/
$scope.createItem = function(Item){
    Item.s_StartDate = $scope.eStYear+"-"+$scope.eStMonth+"-"+$scope.eStDay+" 07:00:00"; 
socket.emit('create_Item', Item)};
    

//$scope.redirect = function(){window.location = "/MS.html";};    
    
    $scope.myImage='';
    $scope.myCroppedImage='';

    var handleFileSelect=function(evt) {
      var file=evt.currentTarget.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        $scope.$apply(function($scope){
          $scope.myImage=evt.target.result;
          $scope.updIm();
        });
      };
      reader.readAsDataURL(file);
    };
$scope.updIm = function(){
        $scope.nLogin.nFile = $scope.myImage;
    }
    
    angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);
});