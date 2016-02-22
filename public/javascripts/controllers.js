
var PartyGuesserApp = angular.module('PartyGuesserApp', []);




PartyGuesserApp.controller('mainCtrl', function ($rootScope,$scope,$http) {
  var l = document.getElementById('indicator');
  var r = document.getElementById('rightindicator');
  l.addEventListener('animationend', function() {
    document.getElementById('indicator').className = "";
  });
  r.addEventListener('animationend', function() {
    document.getElementById('rightindicator').className = "";
  });

  $scope.currentIndex = 0;

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
  $scope.done = function() {
    console.log('test')
    console.log(JSON.stringify($scope.currentSession))
    $http.post('create_session', $scope.currentSession).success(function(res) {
      console.log(res);
      window.location.href = '/results/'+res.id;
    })

    // $http.post("/senators/"+currentSenator.name, {'senator':currentSenator});
  }
  document.getElementById('Done').addEventListener('click', $scope.done);


  $scope.advance = function(party) {
    var currentSenator = $scope.senatorInfo[$scope.currentIndex];

    if (party === currentSenator.party) {
      $http.post("/senators/"+currentSenator.name, {'senator':currentSenator,'correct':true});
      $scope.currentSession.correct.push(currentSenator);

      if (party === 'Republican') {
        r.innerHTML = 'correct';
        r.className = 'animateit-right';
        r.style.color = 'green';
      }
      else {
        l.className = 'animateit';
        l.innerHTML = 'correct';
        l.style.right = '0';
        l.style.color = 'green';
      }
    }
    else {
      $http.post("/senators/"+currentSenator.name, {'senator':currentSenator,'correct':false});
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
      if ($scope.currentIndex > 2) {
        console.log('hi')
        document.getElementById('Done').style.visibility = "visible";
      }
    }
    else {
      $scope.done();
    }
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




PartyGuesserApp.controller('resultsCtrl', function ($rootScope,$scope,$http) {
  $http.get("/session/"+location.href.substr(location.href.lastIndexOf('/') + 1)).success(function(res) {
    console.log(res);
    $scope.sessionInfo = res.session
    makeChart([{num:$scope.sessionInfo.right.length,text:"right"},{num:$scope.sessionInfo.wrong.length,text:"wrong"}])
  });


});


function makeChart(data) {
  var width = 660,
      height = 300,
      radius = Math.min(width, height) / 2;

  var color = d3.scale.ordinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

  var labelArc = d3.svg.arc()
      .outerRadius(radius - 40)
      .innerRadius(radius - 40);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.num; });

  var svg = d3.select("#chart").append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    var g = svg.selectAll(".arc")
        .data(pie(data))
      .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d) {console.log(d.data.num); return (d.data.text === 'right') ? 'lightgreen' : 'red'; });
    g.append("text")
      .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .text(function(d) { return d.data.text; });


  function type(d) {
    d.population = +d.population;
    return d;
  }
}
