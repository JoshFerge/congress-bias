
var PartyGuesserApp = angular.module('PartyGuesserApp', []);



PartyGuesserApp.controller('mainCtrl', function ($rootScope,$scope,$http) {


  $scope.currentIndex = 0

  $scope.currentSession = {
    correct: [],
    incorrect: []
  };


  $scope.getInfo = function() {
    $http.get("/senators").success(function(response) {
      $scope.senatorInfo = $scope.shuffle(response);

    });
  };
  $scope.getInfo();

  $scope.advance = function(party) {

    var currentSenator = $scope.senatorInfo[$scope.currentIndex]

    console.log(party)
    console.log(currentSenator.party)
    if (party === currentSenator.party) {
      $scope.currentSession.correct.push(currentSenator);
    }
    else {
      $scope.currentSession.incorrect.push(currentSenator);
    }

    $http.post("/senators/"+currentSenator.name, {'senator':currentSenator});

    if ($scope.currentIndex < $scope.senatorInfo.length-1) {
      $scope.currentIndex+=1;
    }
    else {
      alert('you done');
    }

    console.log($scope.currentSession);
  }




  $scope.shuffle = function(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
};

});


