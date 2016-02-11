
var PartyGuesserApp = angular.module('PartyGuesserApp', []);

var l;
window.onload = function () {
  l = document.getElementById('indicator');
  r = document.getElementById('rightindicator');
  l.addEventListener('animationend', function() {
    document.getElementById('indicator').className = "";
  });

   r.addEventListener('animationend', function() {
    document.getElementById('rightindicator').className = "";
  });


};





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

      if (party === 'Republican') {
        r.innerHTML = 'correct'
        r.className = 'animateit-right'
        r.style.color = 'green'
      }
      else {
        l.className = 'animateit'
        l.innerHTML = 'correct'
        l.style.right = '0'
        l.style.color = 'green'
      }
    }
    else {
      $scope.currentSession.incorrect.push(currentSenator);
      if (party === 'Republican') {
        r.innerHTML = 'incorrect'
        r.className = 'animateit-right'
        r.style.color = 'red'

      }
      else {
        l.innerHTML = 'incorrect'
        l.className = 'animateit'
        l.style.right = '0'
        l.style.color = 'red'

      }
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


