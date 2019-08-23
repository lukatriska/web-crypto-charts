// const d3 = require("d3/dist/d3");
// const d3 = require("d3");
d3.select('h1').style('color', 'yellow');

let dataset = {
  "2019-07-19": 10526.3917,
  "2019-07-20": 10754.29,
  "2019-07-21": 10586.2433,
  "2019-07-22": 10325.825,
  "2019-07-23": 9849.82,
  "2019-07-24": 9771.5667,
  "2019-07-25": 9882.1,
  "2019-07-26": 9844.5583,
  "2019-07-27": 9466.2717,
  "2019-07-28": 9527.7717,
  "2019-07-29": 9501.0317,
  "2019-07-30": 9588.6033,
  "2019-07-31": 10090.535,
  "2019-08-01": 10405.2067,
  "2019-08-02": 10526.2167,
  "2019-08-03": 10818.6983,
  "2019-08-04": 10979.3133,
  "2019-08-05": 11802.0167,
  "2019-08-06": 11467.1983,
  "2019-08-07": 11981.1517,
  "2019-08-08": 12010.8983,
  "2019-08-09": 11868.7533,
  "2019-08-10": 11289.49,
  "2019-08-11": 11561.71,
  "2019-08-12": 11396.5433,
  "2019-08-13": 10875.3483,
  "2019-08-14": 10036.1867,
  "2019-08-15": 10307.895,
  "2019-08-16": 10358.7683,
  "2019-08-17": 10220.6033,
  "2019-08-18": 10321.7317
};

/*
var width = 120;
var height = 300;

var data = [4,8,15,16,23,42];
document.getElementById("data").innerHTML = data;

let x = d3.scale.linear()
  .domain([0, 6])
  .range([0, width]);

let y = d3.scale.linear()
  .domain([0, 42])
  .range([height, 0]);

d3.select(".chart")
  .attr("width",width)
  .attr("height",height)
  .selectAll("rect")
  .data(data)
  .enter().append("rect")
  .attr("width",19)
  .attr("height",function(d) { return height - y(d); })
  .attr("x",function(d,i) { return x(i); })
  .attr("y",function(d) { return y(d); });
*/


// let data = [];
//
// for (let i in dataset) data.push(dataset[i]);
//

let data = [10526, 10754, 10586, 10325, 9849];

/*
var width = 120;
var height = 300;

let data = [80, 100, 56, 120, 180];

document.getElementById("data").innerHTML = data;

var x = d3.scale.linear()
  .domain([0,6])
  .range([0,width]);

var y = d3.scale.linear()
  .domain([0,42])
  .range([height,0]);

d3.select(".chart")
  .attr("width",width)
  .attr("height",height)
  .selectAll("rect")
  .data(data)
  .enter().append("rect")
  .attr("width",19)
  .attr("height",function(d) { return height - y(d); })
  .attr("x",function(d,i) { return x(i); })
  .attr("y",function(d) { return y(d); });
*/

let svgWidth = 500, svgHeight = 300, barPadding = 5;
let barWidth = (svgWidth / data.length);

let svg = d3.select('svg')
  .attr("width", svgWidth)
  .attr("height", svgHeight);

let yScale = d3.scaleLinear()
  .domain([0, data.length])
  .range([0, svgHeight]);


let barChart = svg.selectAll("rect")
  .data(data)
  .enter()
  .append("rect")
  .attr("y", function (d) {
    return svgHeight - (d);
  })
  .attr("height", function (d) {
    return (d);
  })
  .attr("width", barWidth - barPadding)
  .attr("transform", function (d, i) {
    let translate = [barWidth * i, 0];
    return "translate(" + translate + ")";
  });







/*let text = svg.selectAll("text")
  .data(dataset)
  .enter()
  .append("text")
  .text(function (d) {
    return d;
  })
  .attr("y", function (d, i) {
    return svgHeight - d - 2;
  })
  .attr("x", function (d, i) {
    return svgHeight - d - 2;
  })*/


/*
d3.select('body')
  .selectAll('p')
  .data(res2)
  .enter()
  .append('p')
  .text('some RR');
*/


// // const d3 = require("./d3.min.js");
//
//
// d3.select('h1').style('color', 'red')
//   .text('some other text');
//
// d3.select('body').append('p').text('some p text');
// d3.select('body').append('p').text('some p text 2');
// d3.select('body').append('p').text('some p text 3');
//
// d3.selectAll('p').style('color', 'blue')
//
// // let data = JSON.parse(data);
// //
// // console.log(data);
//
//
// */
