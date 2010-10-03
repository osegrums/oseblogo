var decaJSON;
function loadDecathlon2010() {
  $.getJSON('/misc/2010.08.21-10cina.json', function(data) {
    decaJSON = data; //Define globally available JSON obj
    makeResultTable();
    initCumulativeGraph();
    initEventGraphTab();
    eventResults('eventGraph1',1, [11.5,14.5]); //Initally load first tab content
    initFancyGallery();
  });
}

function initFancyGallery() {
  $("a.deca_photos").fancybox({
    'modal' : false,
    'hideOnOverlayClick' : true,
    'hideOnContentClick' : true,
    'showCloseButton' : true,
    'showNavArrows' : true,
    'transitionIn' : 'elastic',
    'transitionOut' : 'elastic',
    'speedIn'   : 400,
    'speedOut'    : 200,
    'overlayShow' : false
  });
}

function makeResultTable() {
  $('#results_table_container').append('<table id="results_table" class="data_table"></table>');
  $('#results_table').append('<thead><tr></tr></thead>');
  $('#results_table').append('<tbody></tbody>');
  $('#results_table thead tr').append('<th>Participant</th>');

  $(decaJSON.events).each(function() {
    var title = this.title;
    if (this.type == 'track') {
      title += '<br/>(sec)';
    } else {
      title += '<br/>(m)';
    }

    $('#results_table thead tr').append('<th>'+title+'</th>');
  });
  $('#results_table thead tr').append('<th>Place<br/>(Total pts)</th>');

  $(decaJSON.results).each(function() {
    var myTr = '<tr><td><b>'+this.name+'</b><br/><span class="pts">(Points)</span></td>';
    for (var i = 1; i <= 10; i++) {
      myTr += '<td>'+this['event'+i].result+'<br/><span class="pts">('+this['event'+i].score+')</span></td>';
    }
    myTr += '<td class="total_score"><b>'+this.total_place+'</b><br/>('+this.total_score+')</td>'
    myTr += '</tr>';
    $('#results_table tbody').append(myTr);
  });

  $('#results_table tr:even').addClass('even');
}

function initEventGraphTab() {
  var eventGraphRanges = {1 : [11.5,14.5], 2 : [3,6], 3 : [5,11], 4 : [1,1.75], 5 : [30,75],
                          6 : [10,30], 7 : [10,30], 8 : [1,3], 9 : [0,45], 10 : [250,500]};
  $('#event_tabs').tabs({
    selected : 0,
    select : function(event, ui) {
      var eventSeq = parseInt(ui.panel.id.replace("event",""));
      if ($('#eventGraph'+eventSeq).first().children().size() == 0) { //Load content only if there is nothing inside
        eventResults('eventGraph'+eventSeq, eventSeq, eventGraphRanges[eventSeq]);
      }
    }
  });
}

function trackSortFunction(a, b) {
  if (a.result == 0)
    return 1;
  else if (b.result == 0)
    return -1;
  else
    return a.result - b.result;
}

function fieldSortFunction(a, b) {
  if (a.result == 0)
    return 1;
  else if (b.result == 0)
    return -1;
  else
    return b.result - a.result;
}

function cumulativeSortFunction(a,b) {
  return b.cummulativeSum - a.cummulativeSum;
}

function initCumulativeGraph() {
  var categories = [];
  $(decaJSON.events).each(function() {
    categories[categories.length] = this.title;
  });

  var series = [];
  $(decaJSON.results).each(function() {
    var currSerie = {};
    currSerie.name = this.name;
    currSerie.data = [];
    var cummulativeSum = 0;
    for(var i = 1; i <= 10; i++) {
      cummulativeSum += parseInt(this['event'+i].score);
      currSerie.data[currSerie.data.length] = cummulativeSum;
    }
    currSerie.cummulativeSum = cummulativeSum;
    series[series.length] = currSerie;
  });

  series = series.sort(cumulativeSortFunction);

  new Highcharts.Chart({
      chart: {
         renderTo: 'cumulative_graph',
         defaultSeriesType: 'line',
         marginRight: 10,
         marginBottom: 80
      },
      title: {
        text: 'Cummulative sum of points',
        style: {
          font: 'normal 22px Verdana, sans-serif'
        },
        y: 20
      },
      xAxis: {
        categories:categories,
        labels: {
          rotation: -45,
          align: 'right',
          style: {
            font: 'normal 13px Verdana, sans-serif'
          }
        }
      },
      yAxis: {
         title: {
            text: 'Scored points'
         },
         min: 200,
         max: 4100

      },
      tooltip: {
         formatter: function() {
           return '<center><b>'+ this.series.name +'</b><br/>Sum of points after '+
                  this.x +': '+ this.y +'pts</center>';
         }
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -430,
        y: 54,
        borderWidth: 1
      },
      series:series,
      credits: {enabled: false}
   });
}

function eventResults(container, eventNum, resultRange) {
  var beforeSorting = [];
  var maxScore = 0;
  $(decaJSON.results).each(function() {
    beforeSorting[beforeSorting.length] = {
      name : this.name,
      result : parseFloat(this["event"+eventNum].result),
      score: parseInt(this["event"+eventNum].score)};
    if (maxScore < parseInt(this["event"+eventNum].score)) maxScore = parseInt(this["event"+eventNum].score);
  });
  var eventType = decaJSON.events[eventNum-1].type;
  var sorted = beforeSorting.sort(eventType == 'track' ? trackSortFunction : fieldSortFunction);

  var categories = [];
  var points = [];
  var score = [];
  $(sorted).each(function() {
    categories[categories.length] = this.name;
    points[points.length] = this.result;
    score[score.length] = this.score;
  });
  series = [{
    data : points,
    name : "Result ("+(eventType == 'track' ? 'seconds' : 'meters')+")",
    dataLabels: {
      enabled: true,
      rotation: -90,
      color: '#FFFFFF',
      align: 'right',
      x: -4,
      y: 7,
      formatter: function() {
        return this.y + (eventType == 'track' ? ' s' : ' m');
      },
      style: {
        font: 'normal 10px Verdana, sans-serif'
      }
    }
  },{
    data : score,
    name : "Scored points",
    dataLabels: {
      enabled: true,
      rotation: -90,
      color: '#FFFFFF',
      align: 'right',
      x: -4,
      y: 7,
      formatter: function() {
        return this.y + " pts";
      },
      style: {
        font: 'normal 10px Verdana, sans-serif'
      }
    },
    yAxis: 1
  }];

  new Highcharts.Chart({
      chart: {
        renderTo: container,
        defaultSeriesType: 'column',
        margin: [ 25, 50, 60, 50]
      },
      plotOptions: {
        series: {
          pointWidth: 16,
          groupPadding: 0.13
        }
      },
      title: {
        text: "Event: <b>" + decaJSON.events[eventNum-1].title + "</b>",
        style: {
          font: 'normal 22px Verdana, sans-serif'
        },
        y: 20
      },
      xAxis: {
        categories: categories,
        labels: {
          rotation: -45,
          align: 'right',
          style: {
            font: 'normal 13px Verdana, sans-serif'
          }
        }
      },
      yAxis: [{
         min: resultRange[0],
         max: resultRange[1],
         title: {
            text: eventType == 'track' ? 'Seconds' : 'Meters'
         }
      },{
         min: 0,
         max: (maxScore < 300 ? 250 : 600),
         title: {
            text: 'Points'
         },
         opposite: true
      }],
      legend: {
        align: 'right',
        verticalAlign: 'top',
        x: -150,
        y: 32,
        layout: 'vertical'
      },
      tooltip: {
         formatter: function() {return false}
      },
      series: series,
      credits: {enabled: false}
   });
}
