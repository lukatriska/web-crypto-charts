let margin = {top: 10, right: 110, bottom: 100, left: 80},
  width = 1080,
  height = 700;

let startDate, endDate = "";
const baseUrl = "https://api.coindesk.com/v1/bpi/historical/close.csv";
const volume_url = "https://min-api.cryptocompare.com/data/exchange/histoday?tsym=USD&limit=2000&&api_key=86cf65ef09473df5964e859710cbccbb0c12284cd4e5493023133a9f5035429f";

let endDateInput = document.getElementById("end-date");

let startDateInput = document.getElementById("start-date");
startDateInput.min = "2015-01-01";


// returns a number with commas as thousand separators
const numberWithCommas = (x) => {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
};

// create the main svg
const svg = d3.select(".main-container")
  .append("svg")
  .attr("class", "main-svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .style("cursor", "crosshair")
  .append("g")
  .classed("main-g", true)
  .attr("transform", `translate(${margin.left},${margin.top})`);

// get current date
let currDate = new Date();
let currMonth = (currDate.getMonth() + 1).toString().length !== 2 ? `0${currDate.getMonth() + 1}` : currDate.getMonth() + 1;
let currDay = (currDate.getDate()).toString().length !== 2 ? `0${(currDate.getDate())}` : (currDate.getDate());

if (!localStorage.getItem("startDate")) {
  // define the default start date for the chart (30 days before today)
  let defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 31);
  let defaultStartMonth = (defaultStartDate.getMonth() + 1).toString().length !== 2 ? `0${defaultStartDate.getMonth() + 1}` : defaultStartDate.getMonth() + 1;
  let defaultStartDay = (defaultStartDate.getDate()).toString().length !== 2 ? `0${(defaultStartDate.getDate())}` : (defaultStartDate.getDate());

  // set the value for the start date for 30 days before today
  startDate = `${defaultStartDate.getFullYear()}-${defaultStartMonth}-${defaultStartDay}`;
  startDateInput.value = `${defaultStartDate.getFullYear()}-${defaultStartMonth}-${defaultStartDay}`;
} else {
  startDate = localStorage.getItem("startDate");
}

if (!localStorage.getItem("endDate")) {
  endDate = `${currDate.getFullYear()}-${currMonth}-${currDay}`;
  // set the value for end date input for today
  endDateInput.value = `${currDate.getFullYear()}-${currMonth}-${currDay}`;
} else {
  endDate = localStorage.getItem("endDate");
}

endDateInput.max = `${currDate.getFullYear()}-${currMonth}-${currDay}`;


// getting the volume data
let xhReq = new XMLHttpRequest();
xhReq.open("GET", volume_url, false);
xhReq.send(null);
let volume_data = JSON.parse(xhReq.responseText)["Data"];

// convert Unix timestamps to Date objects in the volume data
for (let i = 0; i < volume_data.length; i++) {
  volume_data[i]["time"] = new Date(volume_data[i]["time"] * 1e3);
  // replace the huge numbers that sometimes appear in the data with the mean
  volume_data[i]["volume"] = (volume_data[i]["volume"] > 61211656445 ? 3481431966 : volume_data[i]["volume"])
}

const drawChart = (url) => d3.csv(url,

  d => {
    return {date: d3.timeParse("%Y-%m-%d")(d.Date), value: Math.floor(d.Close), volume: Math.floor(d.volume)}
  },


  data => {

    console.log(url);

    // remove the redundant 3 messages at the end of data
    data.splice(data.length - 3, 3);

    // configure the volume data array to the range picked by user
    let daysToShow = Math.floor((d3.max(data, d => d.date).getTime() - d3.min(data, d => d.date).getTime()) / 86400000 + 1);
    let currVolumeData = volume_data.slice(volume_data.length - daysToShow);

    // delete the previous chart, if any
    d3.select(".main-g")
      .html("");

    // quick function to show the most recent info in the info-box at the top
    const showMostRecentInfo = () => {
      d3.select(".chart-info__date")
        .text("");
      d3.select(".chart-info__price")
        .text(`Most recent price: $${numberWithCommas(data[data.length - 1].value)}`);
      d3.select(".chart-info__volume")
        .text("");
    };

    // show most recent info after the page loads
    showMostRecentInfo();

    // appending the bottom x axis with dates
    let x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .classed('axis', true)
      .selectAll("text")
      .attr("transform", "translate(-10,10)rotate(-45)");
    // appending the x axis label
    svg.append("text")
      .attr("transform", `translate(${width / 2},${height + margin.top + 60})`)
      .style("text-anchor", "middle")
      .text("Date");


    // appending the left y axis with price
    let y = d3.scaleLinear()
      .domain([d3.min(data, d => d.value) - d3.max(data, d => d.value) / 6, d3.max(data, d => d.value)])
      .range([height, 0]);
    svg.append("g")
      .classed('axis', true)
      .attr("transform", `translate(0,0)`)
      .call(d3.axisLeft(y));
    // appending the left y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 15)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Price, USD");

    // appending the price line to the graph
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr("d", d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value))
      );


    // appending the right y axis with volume
    let y_volume = d3.scaleLinear()
      .domain([0, d3.max(currVolumeData, d => +d.volume)])
      .range([height / 3, 0]);
    svg.append("g")
      .attr("transform", `translate(${width},${height / 3 * 2})`)
      .classed('axis-right', true)
      .call(d3.axisRight(y_volume));
    // appending the right y axis label
    svg.append("text")
      .attr("transform", "rotate(90)")
      .attr("y", 0 - width - margin.right + 5)
      .attr("x", height - margin.bottom - margin.top)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Volume per day, USD");

    // appending the volume bars at the bottom
    let x_volume = d3.scaleBand()
      .range([0, width])
      .domain(currVolumeData.map(d => d.time))
      .paddingInner(0.1);
    svg.append("g")
      .attr("transform", `translate(0, ${height / 3 * 2})`)
      .attr("opacity", 0.7)
      .selectAll("bar")
      .data(currVolumeData)
      .enter().append("rect")
      .style("fill", "steelblue")
      .attr("x", d => x_volume(d.time))
      .attr("width", x_volume.bandwidth())
      .attr("y", d => y_volume(d.volume))
      .attr("height", d => height / 3 - y_volume(d.volume));

    // creating the part of the tooltip that moves when you hover over the chart
    const focus = svg.append('g')
      .attr('class', 'focus');

    focus.append('circle')
      .attr('r', 4.5)
      .classed('price-circle', true);

    focus.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('y2', 0)
      .classed('price-line x', true);

    focus.append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 4.5)
      .classed('price-line y', true);

    focus.append('text')
      .attr('x', 9)
      .attr('dy', '.35em');

    // create an overlay rectangle which we use to see if a mouse is hovering over the chart
    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => {
        showMostRecentInfo();
        focus.style('display', 'none');
      })
      .on('mousemove', mouseAction());

    function mouseAction() {
      return () => {
        updateMousePosition(d3.event.target)
      }
    }

    function bound(value, min, max) {
      if (value < min) {
        return min;
      }
      if (value > max) {
        return max;
      }
      return value;
    }

    function updateMousePosition(target) {
      let mouse = d3.mouse(target);

      // choose day using the x coordinate of the cursor
      const d = data[Math.floor((Math.floor(bound(mouse[0], 0, width)) / (width + 1)) * data.length)];
      const vD = currVolumeData[Math.floor((Math.floor(bound(mouse[0], 0, width)) / (width + 1)) * currVolumeData.length)];

      focus.attr('transform', `translate(${x(d.date)}, ${y(d.value)})`);
      focus.select('line.x')
        .attr('x2', -x(d.date));

      focus.select('line.y')
        .attr('y2', height - y(d.value));

      if (d.date) {
        d3.select(".chart-info__date")
          .text(`Date: ${d.date.getDate()} ${d.date.toLocaleString('default', {month: 'long'})} ${d.date.getFullYear()}`);
        d3.select(".chart-info__price")
          .text(`Price: $${numberWithCommas(d.value)}`);
        d3.select(".chart-info__volume")
          .text(`Volume: $${numberWithCommas(vD.volume)}`)
      }

    }

  });

// draw the initial 30-day chart
localStorage.getItem("startDate") && localStorage.getItem("endDate") ?
  drawChart(`${baseUrl}?start=${localStorage.getItem("startDate")}&end=${localStorage.getItem("endDate")}`) : drawChart(baseUrl);

if (localStorage.getItem("startDate") && !localStorage.getItem("endDate")) {
  drawChart(`${baseUrl}?start=${localStorage.getItem("startDate")}&end=${endDate}`);
}

if (!localStorage.getItem("startDate") && localStorage.getItem("endDate")) {
  drawChart(`${baseUrl}?start=${startDate}&end=${localStorage.getItem("endDate")}`);
}

console.log(localStorage.getItem("startDate"));

// listen for changes in start date input
startDateInput.addEventListener("change", e => {
  let dateArr = e.target.value.split('-');
  if (dateArr.length > 1) {
    startDate = dateArr[0] >= 2015 ? `${dateArr[0]}-${dateArr[1]}-${dateArr[2]}` : null;
    localStorage.setItem("startDate", startDate);
  }
  drawChart(`${baseUrl}?start=${startDate}&end=${endDate}`);
});

// listen for changes in end date input
endDateInput.addEventListener("change", e => {
  let dateArr = e.target.value.split('-');
  if (dateArr.length > 1) {
    endDate = `${dateArr[0]}-${dateArr[1]}-${dateArr[2]}`;
    localStorage.setItem("endDate", endDate);
  }
  drawChart(`${baseUrl}?start=${startDate}&end=${endDate}`);
});
