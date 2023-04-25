const volume_red = 'rgba(255,82,82, 0.8)';
const volume_green = 'rgba(0, 150, 136, 0.8)';
const sma21_blue = 'rgba(135, 206, 235, 1)';

let past_data = [];

const chartElem = document.getElementById('chart');
const chart = LightweightCharts.createChart(chartElem, {
  timeScale: {
    timeVisible: true
  }
});
let candlestickSeries = chart.addCandlestickSeries();
let volumeSeries = chart.addHistogramSeries({
  priceFormat: {
    type: 'volume',
  },
  priceScaleId: '',
  scaleMargins: {
    top: 0.8,
    bottom: 0,
  },
});
let sma21LineSeries = chart.addLineSeries({
  color: sma21_blue,
  lineWidth: 2,
  lastValueVisibile: false,
  priceLineVisible: false
});

function applyChange(change) {
  // see https://github.com/rethinkdb/horizon/blob/next/client/src/ast.js applyChange()
  switch (change.type) {
    case 'initial':
    case 'add':
      past_data.splice(change.new_offset, 0, change)
      break;
    case 'change':
      if (change.old_offset != null) {
        past_data.splice(change.old_offset, 1)
      }
      if (change.new_offset != null) {
        past_data.splice(change.new_offset, 0, change)
      }
      break;
  }
  if (past_data.length > 60) {
    past_data = past_data.splice(past_data.length - 60, pas)
  }
}

function getChartTime(apiTime) {
  return new Date(apiTime).getTime() / 1000
}

function calculateSMA(data, count){
  var avg = function(data) {
    var sum = 0;
    for (var i = 0; i < data.length; i++) {
       sum += data[i].new_val.c;
    }
    return sum / data.length;
  };
  var result = [];
  for (var i=count - 1, len=data.length; i < len; i++){
    var val = avg(data.slice(i - count + 1, i));
    result.push({ time: getChartTime(data[i].new_val.t), value: val});
  }
  result.sort((a,b) => a.time - b.time);
  return result;
}

const socket = io();
socket.on('connect', () => {
  socket.on('candle', (evt) => {
    const val = evt.new_val;
    const time = getChartTime(val.t);
    candlestickSeries.update({time: time, open: val.o, high: val.h, low: val.l, close: val.c});
    volumeSeries.update({time: time, value: val.v, color: (val.c < val.o ? volume_red : volume_green)});
    applyChange(evt);
    let sma21 = calculateSMA(past_data, 21);
    sma21LineSeries.setData(sma21);
  });
})
