AnalyzeChart = function() {
	var inputColor = '#007f00', outputColor = '#00007f', mixedColor = '#005f6f', linearRegressionColor = '#bf8f1f';

	var inputData = { variableName: '(Data not loaded)', unit: '(Data not loaded)', timeSeries: [], interpolant: function() { return 0; } };
	var outputData = { variableName: '(Data not loaded)', unit: '(Data not loaded)', timeSeries: [], interpolant: function() { return 0; } };
	var causeVariable, effectVariable;
	
	var timelineChart, scatterplotChart, correlationGauge;

	// Timeline settings
	var	tlSmoothGraph, tlGraphType; // Smoothgraph true = graphType spline
	var tlEnableMarkers;
	var tlEnableHorizontalGuides;

	// Scatterplot settings
	var spShowLinearRegression

	var retrieveSettings = function()
	{
		if (typeof(Storage)!=="undefined")
		{
			tlEnableMarkers = 			(localStorage["tlEnableMarkers"] || "true") == "true" ? true : false;					// On by default
			tlSmoothGraph = 			(localStorage["tlSmoothGraph"] || "true") == "true" ? true : false;						// On by default
			tlEnableHorizontalGuides = 	(localStorage["tlEnableHorizontalGuides"] || "false") == "true" ? true : false;			// Off by default
			spShowLinearRegression = 	(localStorage["spShowLinearRegression"] || "true") == "true" ? true : false;			// On by default

			tlGraphType = tlSmoothGraph == true ? "spline" : "line"; // spline if smoothGraph = true
		}
	}

	var setSettings = function(newSettings)
	{
		if (typeof newSettings["tlSmoothGraph"] != "undefined")
		{
			tlSmoothGraph = newSettings["tlSmoothGraph"];
			tlGraphType = tlSmoothGraph == true ? "spline" : "line";
			timelineChart.series[0].update({
				type: tlGraphType
			}, false);
			timelineChart.series[1].update({
				type: tlGraphType
			}, false);
			saveSetting("tlSmoothGraph", tlSmoothGraph);
		}

		if (typeof newSettings["tlEnableMarkers"] != "undefined")
		{
			tlEnableMarkers = newSettings["tlEnableMarkers"];
			timelineChart.series[0].update({
				marker:
				{
					enabled: tlEnableMarkers
				}
			}, false);
			timelineChart.series[1].update({
				marker:
				{
					enabled: tlEnableMarkers
				}
			}, false);
			saveSetting("tlEnableMarkers", tlEnableMarkers);
		}

		if (typeof newSettings["tlEnableHorizontalGuides"] != "undefined")
		{
			tlEnableHorizontalGuides = newSettings["tlEnableHorizontalGuides"];
			timelineChart.yAxis[0].update({
				gridLineWidth:tlEnableHorizontalGuides
			}, false)
			timelineChart.yAxis[1].update({
				gridLineWidth:tlEnableHorizontalGuides
			}, false)
			saveSetting("tlEnableHorizontalGuides", tlEnableHorizontalGuides);
		}

		if (typeof newSettings["spShowLinearRegression"] != "undefined")
		{
			spShowLinearRegression = newSettings["spShowLinearRegression"];
			scatterplotChart.series[0].update({
				visible:  spShowLinearRegression
			}, false);
			saveSetting("spShowLinearRegression", spShowLinearRegression);
		}

		timelineChart.redraw();
		scatterplotChart.redraw();
	};

	var saveSetting = function(setting, value)
	{
		if (typeof(Storage)!=="undefined")
		{
			localStorage[setting] = value;
		}
	}

	var initChartSettings = function()
	{
		jQuery('input[name=tl-enable-markers]').attr('checked', tlEnableMarkers);
		jQuery('input[name=tl-enable-markers]').change(function()
		{
			var settings = {
				tlEnableMarkers : jQuery(this).is(":checked")
			};
			setSettings(settings);
		});

		jQuery('input[name=tl-smooth-graph]').attr('checked', tlSmoothGraph);
		jQuery('input[name=tl-smooth-graph]').change(function()
		{
			var settings = {
				tlSmoothGraph : jQuery(this).is(":checked")
			};
			setSettings(settings);

		});

		jQuery('input[name=tl-enable-horizontal-guides]').attr('checked', tlEnableHorizontalGuides);
		jQuery('input[name=tl-enable-horizontal-guides]').change(function()
		{
			var settings = {
				tlEnableHorizontalGuides : jQuery(this).is(":checked")
			};
			setSettings(settings);
		});

		jQuery('input[name=sp-show-linear-regression]').attr('checked', spShowLinearRegression);
		jQuery('input[name=sp-show-linear-regression]').change(function()
		{
			var settings = {
				spShowLinearRegression : jQuery(this).is(":checked")
			};
			setSettings(settings);
		});		
	}

	var updateGraphs = function()	//TODO split graphs, update series separately
	{
		var versus;
		if (inputData.variableName == outputData.variableName)
		{
			versus = inputData.variableName;
		}
		else
		{
			versus = inputData.variableName + ' vs ' + outputData.variableName;
		}

		timelineChart.setTitle({ text: versus });
		timelineChart.yAxis[0].update({ title: { text: inputData.variableName + ' (' + inputData.unit + ')'} }, false);
		timelineChart.yAxis[1].update({ title: { text: outputData.variableName  + ' (' + outputData.unit + ')'} }, false);

		timelineChart.series[0].update({ name: inputData.variableName, data: inputData.timeSeries}, false);
		timelineChart.series[1].update({ name: outputData.variableName, data: outputData.timeSeries}, false);


		var minimum = +Infinity, maximum = -Infinity;
		
		for(var i=0; i<inputData.timeSeries.length; i++)
		{
			if(inputData.timeSeries[i][1] && inputData.timeSeries[i][1] > 0)
			{
				if (minimum > inputData.timeSeries[i][0]) minimum = inputData.timeSeries[i][0];
				if (maximum < inputData.timeSeries[i][0]) maximum = inputData.timeSeries[i][0];
			}
		}
		for(var i=0; i<outputData.timeSeries.length; i++)
		{
			if(outputData.timeSeries[i][1] && outputData.timeSeries[i][1] > 0)
			{
				if (minimum > outputData.timeSeries[i][0]) minimum = outputData.timeSeries[i][0];
				if (maximum < outputData.timeSeries[i][0]) maximum = outputData.timeSeries[i][0];
			}
		}

		timelineChart.redraw();
		timelineChart.xAxis[0].setExtremes(minimum, maximum);

		initDatePickerForHighChartsRangeSelecter(minimum, maximum);


		var cause, effect;
		var inputIsCause = (jQuery('#selectOutputAsType').val() == 'effect');

		if (inputIsCause) {
			cause = inputData;
                        causeColor = inputColor;
			effect = outputData;
                        effectColor = outputColor;
		} else {
			cause = outputData;
                        causeColor = outputColor;
			effect = inputData;
                        effectColor = inputColor;
		}

		var hideScatterplot = (typeof cause.originalName == 'undefined' || typeof effect.originalName == 'undefined');
		if (hideScatterplot) 
		{

		}
		else 
		{
			Quantimodo.getPairs({
				'effect': effect.originalName,
				'cause': cause.originalName,
				'startTime': AnalyzePage.getStartTime(),
				'endTime': AnalyzePage.getEndTime()
			},
			function(measurements) 
			{
				if (measurements.length) 
				{
					var scatterplotDots = [];
					var xMax = -Infinity, yMax = -Infinity, xMin = +Infinity, yMin = +Infinity ;
					
					for (var i in measurements) 
					{
						var dot = {
                                                    x: measurements[i].causeMeasurement,
                                                    y: measurements[i].effectMeasurement
						};

						dot.time = measurements[i].timestamp * 1000;

						scatterplotDots.push(dot);

						if (xMax < dot.x) xMax = dot.x;
						if (yMax < dot.y) yMax = dot.y;
						if (xMin > dot.x) xMin = dot.x;
						if (yMin > dot.y) yMin = dot.y;
					}

					yMax = yMax * 1.1;
					xMax = xMax * 1.1;
                                        
					scatterplotChart.setTitle({ text: versus });
					scatterplotChart.yAxis[0].update({ min: yMin, max: yMax, title: { text: effect.variableName + ' (' + effect.unit + ')'} }, false);
					scatterplotChart.xAxis[0].update({ min: xMin, max: xMax, title: { text: cause.variableName  + ' (' + cause.unit + ')'} }, false);
                                        scatterplotChart.tooltip.options.formatter = function() {
                                                return '<b>' + Highcharts.dateFormat('%Y %b %d', this.point.time) + '</b><br>' +
                                                    '<span style="color: ' + effectColor + ';">' + Highcharts.numberFormat(this.point.y, 2) + effect.unit + ' (' + effect.source + ')</span> with ' +
                                                    '<span style="color: ' + causeColor + ';">' + Highcharts.numberFormat(this.point.x, 2) + cause.unit + ' (' + cause.source + ')</span>';
                                            };
					
					scatterplotChart.series[0].setData(QuantimodoMath.linearRegressionEndpoints(scatterplotDots, cause.minimum, cause.maximum), false);
					scatterplotChart.series[1].update({ name: versus }, false);
					scatterplotChart.series[1].setData(scatterplotDots, false);			
					
					scatterplotChart.redraw();

					var correlation = Math.min(1, Math.max(-1, QuantimodoMath.correlationCoefficient(scatterplotDots)));
					correlationGauge.series[0].points[0].update(correlation);

					setAngularChartText(correlation, scatterplotDots.length);           
				}
			});
		}

	};

	function setAngularChartText(correlation, numOfPoints) {
		var effectSizeText;
		var statisticalRelationshipText = "Not enough samples";
		if (correlation > 0.5)
		{
			effectSizeText = "Strong Positive";
			if (numOfPoints > 17)
			{
				statisticalRelationshipText = "Significant";
			}
		}
		else if (correlation > 0.3)
		{
			effectSizeText = "Medium Positive";
			if (numOfPoints > 45)
			{
				statisticalRelationshipText = "Significant";
			}
		}
		else if (correlation > 0.1)
		{
			effectSizeText = "Weak Positive";
			if (numOfPoints > 400)
			{
				statisticalRelationshipText = "Significant";
			}
		}
		else if (correlation > -0.1)
		{
			effectSizeText = "None";
		}
		else if (correlation > -0.3)
		{
			effectSizeText = "Weak Negative";
			if (numOfPoints > 400)
			{
				statisticalRelationshipText = "Significant";
			}
		}
		else if (correlation > -0.5)
		{
			effectSizeText = "Medium Negative";
			if (numOfPoints > 45)
			{
				statisticalRelationshipText = "Significant";
			}
		}
		else
		{
			effectSizeText = "Strong Negative";
			if (numOfPoints > 17)
			{
				statisticalRelationshipText = "Significant";
			}
		}

		jQuery('#statisticalRelationshipValue').text(statisticalRelationshipText);
		jQuery('#effectSizeValue').text(effectSizeText);
	}

    function initDatePickerForHighChartsRangeSelecter(minimum, maximum) {
        if (timelineChart != null) 
        {
			if (!jQuery("input.highcharts-range-selector[name='min']", jQuery('#' + timelineChart.options.chart.renderTo)).hasClass('hasDatepicker')) 
			{
				jQuery("input.highcharts-range-selector[name='min']", jQuery('#' + timelineChart.options.chart.renderTo)).datepicker( {
					dateFormat: "'From' MM d',' yy",
					defaultDate: new Date(minimum),
					minDate: new Date(minimum),
					maxDate: new Date(maximum),                    
					changeMonth: true,
					changeYear: true,                        
					onSelect: function(dateText) {
						var currentMin = jQuery(this).datepicker("getDate");
						var currentMax = new Date(jQuery("input.highcharts-range-selector[name='max']", jQuery('#' + timelineChart.options.chart.renderTo)).val());
						if (currentMax.getTime() - currentMin.getTime() < ((5 * 24 * 60 * 60 * 1000)))
						{
							currentMin.setTime(currentMax.getTime() - ((5 * 24 * 60 * 60 * 1000)));
						}
						else 
						{
							currentMin.setTime(currentMin.getTime());
						}
						jQuery("input.highcharts-range-selector[name='min']", jQuery('#' + timelineChart.options.chart.renderTo)).datepicker( "option", "defaultDate", currentMin);
						jQuery("input.highcharts-range-selector[name='min']", jQuery('#' + timelineChart.options.chart.renderTo)).val(jQuery.datepicker.formatDate("'To' MM d',' yy", new Date(currentMin.getTime() + (24 * 60 * 60 * 1000))));
						this.onchange();
						this.onblur();
					}
				});
			}
			else 
			{
				jQuery("input.highcharts-range-selector[name='min']", jQuery('#' + timelineChart.options.chart.renderTo)).datepicker( "option", "defaultDate", new Date(minimum));
				jQuery("input.highcharts-range-selector[name='min']", jQuery('#' + timelineChart.options.chart.renderTo)).datepicker( "option", "minDate", new Date(minimum));
				jQuery("input.highcharts-range-selector[name='min']", jQuery('#' + timelineChart.options.chart.renderTo)).datepicker( "option", "maxDate", new Date(maximum));
			}

			if (!jQuery("input.highcharts-range-selector[name='max']", jQuery('#' + timelineChart.options.chart.renderTo)).hasClass('hasDatepicker'))
			{
				jQuery("input.highcharts-range-selector[name='max']", jQuery('#' + timelineChart.options.chart.renderTo)).datepicker({
					dateFormat: "'From' MM d',' yy",
					defaultDate: new Date(maximum),
					minDate: new Date(minimum),
					maxDate: new Date(maximum),                       
					changeMonth: true,
					changeYear: true,
					onSelect: function(dateText) {
						var currentMax = jQuery(this).datepicker("getDate");
						var currentMin = new Date(jQuery("input.highcharts-range-selector[name='min']", jQuery('#' + timelineChart.options.chart.renderTo)).val());
						if (currentMax.getTime() - currentMin.getTime() < ((5 * 24 * 60 * 60 * 1000)))
						{
							currentMax.setTime(currentMin.getTime() + ((5 * 24 * 60 * 60 * 1000)));
						}
						else
						{
							currentMax.setTime(currentMax.getTime());
						}
						jQuery("input.highcharts-range-selector[name='max']", jQuery('#' + timelineChart.options.chart.renderTo)).datepicker( "option", "defaultDate", currentMax);
						jQuery("input.highcharts-range-selector[name='max']", jQuery('#' + timelineChart.options.chart.renderTo)).val(jQuery.datepicker.formatDate("'To' MM d',' yy", new Date(currentMax.getTime() + (24 * 60 * 60 * 1000))));
						this.onchange();
						this.onblur();
					}
				});
			}
			else
			{
				jQuery("input.highcharts-range-selector[name='max']", jQuery('#' + timelineChart.options.chart.renderTo)).datepicker( "option", "defaultDate", new Date(maximum));
				jQuery("input.highcharts-range-selector[name='max']", jQuery('#' + timelineChart.options.chart.renderTo)).datepicker( "option", "minDate", new Date(minimum));
				jQuery("input.highcharts-range-selector[name='max']", jQuery('#' + timelineChart.options.chart.renderTo)).datepicker( "option", "maxDate", new Date(maximum));
			}
        }
    }

	function fillBeforeWithValue(firstDate, fillingValue, dates, values, timeSeries)
	{
		var groupingWidth = AnalyzePage.getPeriod() * 1000;
		var startTime = AnalyzePage.getStartTime() * 1000;
		var timeDiff =  firstDate - startTime;

		var numInsertions = timeDiff / groupingWidth;
		if (numInsertions > 0)
		{
			fillWithValue(startTime, numInsertions, groupingWidth, fillingValue, dates, values, timeSeries);
		}
	}
	function fillBetweenWithValue(date, nextDate, fillingValue, dates, values, timeSeries)
	{
		var groupingWidth = AnalyzePage.getPeriod() * 1000;
		var timeDiff = nextDate - date;
		var numInsertions =  timeDiff / groupingWidth;
		if (numInsertions > 0)
		{
			fillWithValue(date, numInsertions, groupingWidth, fillingValue, dates, values, timeSeries);
		}
	}
	function fillAfterWithValue(lastDate, fillingValue, dates, values, timeSeries)
	{
		var groupingWidth = AnalyzePage.getPeriod() * 1000;
		var timeDiff = (AnalyzePage.getEndTime() * 1000) - lastDate;

		var numInsertions = timeDiff / groupingWidth;
		if (numInsertions > 0)
		{
			fillWithValue(lastDate, numInsertions, groupingWidth, fillingValue, dates, values, timeSeries);
		}
	}

	function fillWithValue(startDate, numInsertions, interval, fillingValue, dates, values, timeSeries)
	{
		for(n = 1; n < numInsertions; n++)
		{
			var newDate = parseInt(startDate + (interval * n));
			dates.push(newDate);
			values.push(fillingValue);
			timeSeries.push([newDate, fillingValue]);
		}
	}

	var prepDataForGraphing = function(variable, data)
	{
		data.sort(function(a, b) { return a.timestamp < b.timestamp ? -1 : 1; });
		var dates = [], values = [], timeSeries = [];

		var noData = data.length === 0;
		var minimum = noData ? null : variable.minimumValue;
		if (minimum == -Infinity) { minimum = null;}
		var maximum = noData ? null : variable.maximumValue;
		if (maximum == Infinity) { maximum = null; }

		for (var i = 0; i < data.length; i++)
		{                        
			var date = data[i].timestamp * 1000
			var value = data[i].value;
						
			dates.push(date);
			values.push(value);
			timeSeries.push([date, value]);

			if (data[i].repeat != null)
			{
				var numRepeats = data[i].repeat.times;
				var interval = data[i].repeat.interval * 1000;
				for(n = 0; n < numRepeats; n++)
				{
					date += interval;
					dates.push(date);
					values.push(value);
					timeSeries.push([date, value]);
				}
			}
		}
				
		return {
			source: data[0].source.valueOf(),
			originalName: variable.originalName,
			variableName: variable.name.valueOf(),
			unit: noData ? 'unknown' : data[0].unit.valueOf(),                        
			minimum: minimum,
			maximum: maximum,
			timeSeries: timeSeries,
			interpolant: QuantimodoMath.createInterpolant(dates, values)
		};
	};

	var setInputData = function(variable, data)
	{
		causeVariable = variable;
		inputData = prepDataForGraphing(variable, data);
		updateGraphs();
	};

	var setOutputData = function(variable, data)
	{
		effectVariable = variable;
		outputData = prepDataForGraphing(variable, data);
		updateGraphs();
	};

	var initTimelineChart = function()
	{
		var resolution = 	'<div class="resolutionLabel">Resolution</div>'+
							'<div class="resolutionCover accordion-content closed" id="accordion-date-content">'+
								'<div class="inner resolutionOnTimeLine">'+						
									'<div id="accordion-content-rangepickers">'+
										'<input type="radio" value="Hour" id="radio3" name="radio" /><label for="radio3">Hour</label>'+
										'<input type="radio" value="Day" id="radio4" name="radio" checked="checked" /><label for="radio4">Day</label>'+
										'<input type="radio" value="Week" id="radio5" name="radio" /><label for="radio5">Week</label>'+
										'<input type="radio" value="Month" id="radio6" name="radio" /><label for="radio6">Month</label>'+
									'</div>'+
								'</div>'+
							'</div>';				
		timelineChart = new Highcharts.StockChart({
			chart: { renderTo: 'graph-timeline', zoomType: 'x'},
			title: { text: '(Data not loaded)' },
			subtitle: { text: 'from Quantimodo.com'+resolution, useHTML:true },
			legend: { enabled: false },
			scrollbar: {
				barBackgroundColor: '#eeeeee',
				barBorderRadius: 0,
				barBorderWidth: 0,
				buttonBackgroundColor: '#eeeeee',
				buttonBorderWidth: 0,
				buttonBorderRadius: 0,
				trackBackgroundColor: 'none',
				trackBorderWidth: 0.5,
				trackBorderRadius: 0,
				trackBorderColor: '#CCC'
			},
			navigator : {
				adaptToUpdatedData: true,
				margin: 10,
				height: 50,
				handles: {
					backgroundColor: '#eeeeee'
				}
			},
			xAxis: {
				type: 'datetime',
				gridLineWidth:false,
				dateTimeLabelFormats: {
					millisecond: '%H:%M:%S.%L',
					second: '%H:%M:%S',
					minute: '%H:%M',
					hour: '%H:%M',
					day: '%e. %b',
					week: '%e. %b',
					month: '%b \'%y',
					year: '%Y'
				}
			},
			yAxis: [
				{
					gridLineWidth:tlEnableHorizontalGuides,
					title: { text: '(Data not loaded)', style: { color: inputColor } },
					labels: { formatter: function() { return this.value; }, style: { color: inputColor } }
				},
				{
					gridLineWidth:tlEnableHorizontalGuides,
					title: { text: '(Data not loaded)', style: { color: outputColor } },
					labels: { formatter: function() { return this.value; }, style: { color: outputColor } },
					opposite: true
				}
			],
			tooltip: {
				formatter: function() {
					var result = '<span style="color: ' + (this.points.length === 1 ? this.points[0].series.options.color : mixedColor) + ';"><i>' +
						Highcharts.dateFormat('%Y %b %d', this.points[0].x) + '</i></span><br>';                                         
					for (var i = 0; i < this.points.length; i++) {
						var point = this.points[i];                                                
						if (i !== 0) { result += '<br>'; }												
						result += '<span style="color: ' + point.series.options.color + ';"><b>'+ point.series.name + ' (' + (point.series.options.color == inputColor ? inputData.source : outputData.source) + ')</b>: ' +
							Highcharts.numberFormat(point.y, 2) + '</span>';                                                
					}
					return result;
				},
				shared: true, useHTML: true
			},
			plotOptions: {
				series: {
					lineWidth: 1,
					states: {
						hover: {
							enabled: true,
							lineWidth: 1.5
						}
					}
				}
			},
			series: [
				{ yAxis: 0, name: '(Data not loaded)', type: tlGraphType, color: inputColor, data: [], marker: { enabled: tlEnableMarkers, radius: 3 }},
				{ yAxis: 1, name: '(Data not loaded)', type: tlGraphType, color: outputColor, data: [], marker: { enabled: tlEnableMarkers, radius: 3 }}
			],
			credits: {
				enabled: false
			},
	        rangeSelector: { 
	            inputBoxWidth: 120,
	            inputBoxHeight: 18
	        }
		});            
	};

        var initScatterplotChart = function()
	{
		scatterplotChart = new Highcharts.Chart({
			chart: { renderTo: 'graph-scatterplot', type: 'scatter', zoomType: 'xy'},
			title: { text: '(Data not loaded)' },
			subtitle: { text: 'from Quantimodo.com' },
			xAxis: {
				title: { text: '(Data not loaded)', style: { color: outputColor } },
				labels: {formatter: function() { return outputData.unit === 'unknown' ? '' : this.value; }, style: { color: outputColor } }
			},
			yAxis: {
				title: { text: '(Data not loaded)', style: { color: inputColor } },
				labels: {useHTML: true, formatter: function() { return inputData.unit === 'unknown' ? '' : this.value + '&nbsp;'; }, style: { color: inputColor } }
			},
			legend: { enabled: false },
			plotOptions: {
				scatter: {
					marker: { radius: 5, states: { hover: { enabled: true, lineColor: mixedColor } } },
					states: { hover: { marker: { enabled: false } } }
				},
				series: {
					turboThreshold: 0
				}
			},
			tooltip: {
				formatter: function() {
					return '<b>' + Highcharts.dateFormat('%Y %b %d', this.point.time) + '</b><br>' +
						'<span style="color: ' + inputColor + ';">' + Highcharts.numberFormat(this.point.y, 2) + inputData.unit + ' (' + inputData.source + ')</span> with ' +
						'<span style="color: ' + outputColor + ';">' + Highcharts.numberFormat(this.point.x, 2) + outputData.unit + ' (' + outputData.source + ')</span>';
				},
				useHTML: true
			},
			series: [
				{ type: 'line', color: linearRegressionColor, enableMouseTracking: false, visible: false /*spShowLinearRegression*/, marker: { enabled: false }, data: [] },
				{ name: '(Data not loaded)', color: mixedColor, data: [] }
			],
			credits: {
				enabled: false
			}
		});
	};

	var initCorrelationGauge = function()
	{
		correlationGauge = new Highcharts.Chart({
			chart: {
				renderTo: 'gauge-correlation',
				type: 'gauge',
				width: 255
			},
			tooltip: {
				enabled: false,
			},
			title: {
				text: ''
			},
			pane: {
				startAngle: -180,
				endAngle: 0,
				background: null
			},
			yAxis: [{
				min: -1,
				max: 1,
				minorTickPosition: 'outside',
				tickPosition: 'outside',
				tickPixelInterval: 40,
				labels: {
					rotation: '0',
					distance: 25
				},
				plotBands: [{
					from: -1,
					to: 0,
					color: '#e5394a',
					innerRadius: '100%',
					outerRadius: '105%'
				},{
					from: 0,
					to: 1,
					color: '#65af5d',
					innerRadius: '100%',
					outerRadius: '105%'
				}

				],
				pane: 0,
			}],
			plotOptions: {
				gauge: {
					dataLabels: {
						enabled: false
					},
					dial: {
						radius: '100%'
					}
				}
			},
			series: [{
				data: [0],
				yAxis: 0
			}],
			credits: {
				enabled: false
			}
		});
	}

	return {
		init: function()
		{
			retrieveSettings();
			initChartSettings();

			initTimelineChart();
			initScatterplotChart();
			initCorrelationGauge();
		},
		setInputData: setInputData,
		setOutputData: setOutputData,
	};
}();

jQuery(AnalyzeChart.init);