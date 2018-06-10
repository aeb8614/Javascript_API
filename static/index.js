//name function
d3.json("/names", function(error, response) {
    if (error) return console.warn(error);

    var $dropDown = document.getElementById("selDataset");

    for (var i = 0; i < response.length; i++) {
        var $optionChoice = document.createElement("option");
        $optionChoice.innerHTML = response[i];
        $optionChoice.setAttribute("value", response[i]);
        $dropDown.appendChild($optionChoice);
    };
});

//webpage from template
function init(sample) {
    getMetadata(sample);
    
    // Pie chart
    d3.json("/samples/" + sample, function(error, sampleResponse) {
        if (error) return console.warn(error);

        resLabels = sampleResponse[0]["otu_ids"].slice(0,10);
        resValues = sampleResponse[1]["sample_values"].slice(0,10);

        for (var i = 0; i < 10; i++) {
            if (resLabels[i] == 0) {
                resLabels = resLabels.slice(0, i)
            };
            if (resValues[i] == 0) {
                resValues[i] = resValues.slice(0, i)
            };
        };

        // get descriptions
        d3.json("/otu_descriptions", function(error, otuResponse) {

        if (error) return console.warn(error);

        var bacteriaNamesPie = [];
        for (var i = 0; i < resLabels.length; i++) {
            bacteriaNamesPie.push(otuResponse[resLabels[i]])
        };

        var bacteriaNamesBub = [];
        for (var i = 0; i < sampleResponse[0]["otu_ids"].length; i++) {
            bacteriaNamesBub.push(otuResponse[sampleResponse[0]["otu_ids"][i]])
        };

        var data = [{values: resValues,
                     labels: resLabels,
                     hovertext: bacteriaNamesPie,
                     hoverinfo: {bordercolor: 'black'},
                     type: 'pie'}];

        var layout = {height: 500,
                      title: "Top Sample Counts for " + sample};

        // plots piechart
        Plotly.newPlot('piePlot', data, layout);

        // Bubble chart
        var trace = {x: sampleResponse[0]["otu_ids"],
                     y: sampleResponse[1]["sample_values"],
                     mode: 'markers',
                     marker: {colorscale: 'Earth',
                              color: sampleResponse[0]["otu_ids"],
                              size: sampleResponse[1]["sample_values"]},
                     text: bacteriaNamesBub,
                     type: "scatter"};

        var bubbleData = [trace];

        var bubbleLayout = {title: 'Sample Values for ' + sample,
                            xaxis: {title: "OTU ID"},
                            hovermode: 'closest',
                            showlegend: false,
                            height: 600,
                            margin: {top: 10,
                                     bottom: 10,
                                     right: 10,
                                     left: 10}};

        // plots bubble chart
        Plotly.newPlot('bubblePlot', bubbleData, bubbleLayout);
      });
    });


// update pie chart function
function updatePie(newValues, newLabels, newNames, sample_name){
    Plotly.restyle("piePlot", "values", [newValues]);
    Plotly.restyle("piePlot", "labels", [newLabels]);
    Plotly.restyle("piePlot", "hovertext", [newNames]);
    Plotly.relayout("piePlot", "title", "Top Sample Counts for " + sample_name);
    console.log("Pie Chart Updated!");};

// update bubble chart function
function updateBub(values, labels, names, sample_name){
    Plotly.restyle("bubblePlot", "x", [labels]);
    Plotly.restyle("bubblePlot", "y", [values]);
    Plotly.restyle("bubblePlot", "marker.size", [values]);
    Plotly.restyle("bubblePlot", "text", [names]);
    Plotly.relayout("bubblePlot", "title", "Sample Values for " + sample_name);
    console.log("Bubble Chart Updated!");};


//dropdown
function optionChanged(chosenSample) {
  getMetadata(chosenSample);

  d3.json("/samples/" + chosenSample, function(error, newResponse) {
  if (error) return console.warn(error);

  var newResLabels = newResponse[0]["otu_ids"].slice(0,10);
  var newResValues = newResponse[1]["sample_values"].slice(0,10);

  for (var i = 0; i < 10; i++){
    if (newResLabels[i] == 0){
        newResLabels = resLabels.slice(0,i)
    };
    if (newResValues[i] == 0){
        newResValues[i] = resValues.slice(0,i)
    };
  };

  d3.json("/otu_descriptions", function(error, newOtuResponse) {
  if (error) return console.warn(error);

  var newBacteriaNames = [];

  for (var i = 0; i < newResLabels.length; i++) {
      newBacteriaNames.push(newOtuResponse[newResLabels[i]])};

  var allBacteriaNames = [];
  for (var i = 0; i < newResponse[0]["otu_ids"].length; i++) {
      allBacteriaNames.push(newOtuResponse[newResponse[0]["otu_ids"][i]])};

  // new variables for updateBub function
  var newValuesBub = newResponse[1]['sample_values'];
  var newLabelsBub = newResponse[0]['otu_ids'];

  // update plots
  updatePie(newResValues, newResLabels, newBacteriaNames, chosenSample);
  updateBub(newValuesBub, newLabelsBub, allBacteriaNames, chosenSample);
  })
  });
};


function getMetadata(selectedID) {
  d3.json("/metadata/" + selectedID, function(error, response) {
    if (error) return console.warn(error);
    var resKeys = Object.keys(response);
    var $sampleMetadata = document.querySelector("#sample-metadata");

    $sampleMetadata.innerHTML = null;
    for (var i = 0; i < resKeys.length; i++) {
        var $newDataLine = document.createElement('p');
        $newDataLine.innerHTML = resKeys[i] + ": " + response[resKeys[i]];
        $sampleMetadata.appendChild($newDataLine)
    };
  });
};

// initial render using first sample in dataset
init("BB_940");
