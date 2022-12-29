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

function calculateSMA(data, count){
  var avg = function(data) {
    var sum = 0;
    for (var i = 0; i < data.length; i++) {
       sum += data[i].close;
    }
    return sum / data.length;
  };
  var result = [];
  for (var i=count - 1, len=data.length; i < len; i++){
    var val = avg(data.slice(i - count + 1, i));
    result.push({ time: data[i].time, value: val});
  }
  return result;
}

const volume_red = 'rgba(255,82,82, 0.8)';
const volume_green = 'rgba(0, 150, 136, 0.8)';

const socket = io();
socket.on('connect', () => {
	socket.on('candle', (evt) => {
		const val = evt.new_val;
    const time = new Date(val.t).getTime() / 1000;
    candlestickSeries.update({time: time, open: val.o, high: val.h, low: val.l, close: val.c});
    volumeSeries.update({time: time, value: val.v, color: (val.c < val.o ? volume_red : volume_green)});
	});
})
