var decaJSON;
function loadDecathlon2010() {
  var eventGraphRanges = {1 : [11.5,14.5], 2 : [3,6], 3 : [5,11], 4 : [1,1.75], 5 : [30,75],
                          6 : [10,30], 7 : [10,30], 8 : [1,3], 9 : [0,45], 10 : [250,500]};
  $.getJSON('/misc/2010.08.21-10cina.json', function(data) {
    decaJSON = data; //Define globally available JSON obj
    $("#event_tabs").tabs({
      selected : 0,
      select : function(event, ui) {
        var eventSeq = parseInt(ui.panel.id.replace("event",""));
        if ($('#eventGraph'+eventSeq).first().children().size() == 0) { //Load content only if there is nothing inside
          eventResults('eventGraph'+eventSeq, eventSeq, eventGraphRanges[eventSeq]);
        }
      }
    });
    eventResults('eventGraph1',1, [11.5,14.5]); //Initally load first tab content
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
        layout: "vertical"
      },
      tooltip: {
         formatter: function() {return false}
      },
      series: series,
      credits: {enabled: false}
   });
}
