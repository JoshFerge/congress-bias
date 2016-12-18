/* globals angular */
var PartyGuesserApp = angular.module('PartyGuesserApp', []);

PartyGuesserApp.controller('mainCtrl', function ($rootScope,$scope,$http) {
  var l = document.getElementById('indicator');
  var r = document.getElementById('rightindicator');
  l.addEventListener('animationend', function() {
    document.getElementById('indicator').className = '';
  });
  r.addEventListener('animationend', function() {
    document.getElementById('rightindicator').className = '';
  });

  $scope.currentIndex = 0;

  $scope.currentSession = {
    correct: [],
    incorrect: []
  };

  $scope.getInfo = function() {
    $http.get('/senators').success(function(response) {
      $scope.senatorInfo = $scope.shuffle(response);

    });
  };
  $scope.getInfo();
  $scope.done = function() {
    $http.post('create_session', $scope.currentSession).success(function(res) {
      console.log(res);
      window.location.href = '/results/'+res.id;
    });

    // $http.post('/senators/'+currentSenator.name, {'senator':currentSenator});
  };
  document.getElementById('Done').addEventListener('click', $scope.done);


  $scope.advance = function(party) {
    var currentSenator = $scope.senatorInfo[$scope.currentIndex];

    if (party === currentSenator.party) {
      $http.post('/senators/'+currentSenator.name, {'senator':currentSenator,'correct':true});
      $scope.currentSession.correct.push(currentSenator);

      if (party === 'Republican') {
        r.innerHTML = 'correct';
        r.className = 'animateit-right';
        r.style.color = '#38D839';
      }
      else {
        l.className = 'animateit';
        l.innerHTML = 'correct';
        l.style.right = '0';
        l.style.color = '#38D839';
      }
    }
    else {
      $http.post('/senators/'+currentSenator.name, {'senator':currentSenator,'correct':false});
      $scope.currentSession.incorrect.push(currentSenator);
      if (party === 'Republican') {
        r.innerHTML = 'incorrect';
        r.className = 'animateit-right';
        r.style.color = 'red';
      }
      else {
        l.innerHTML = 'incorrect';
        l.className = 'animateit';
        l.style.right = '0';
        l.style.color = 'red';
      }
    }

    if ($scope.currentIndex < $scope.senatorInfo.length-1) {
      $scope.currentIndex+=1;
      console.log($scope.currentIndex);
      if ($scope.currentIndex > 10) {
        document.getElementById('Done').style.visibility = 'visible';
      }
    }
    else {
      $scope.done();
    }
  };

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




PartyGuesserApp.controller('resultsCtrl', function ($rootScope,$scope,$http) {
  $http.get('/session/'+location.href.substr(location.href.lastIndexOf('/') + 1)).success(function(res) {
    console.log(res);
    $scope.sessionInfo = res.session;
    // console.log($scope.sessionInfo.left);
    document.getElementById('results').innerHTML = 'You got ' + $scope.sessionInfo.right.length + ' right and ' + $scope.sessionInfo.wrong.length + ' wrong!';
  });
});
