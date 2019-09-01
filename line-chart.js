let margin = {top: 10, right: 110, bottom: 100, left: 80},
  width = 760,
  height = 400;

// converts a Date object to date string
const getDateString = (date) => `${date.getDate()} ${date.toLocaleString('default', {month: 'long'})} ${date.getFullYear()}`;


const svg = d3.select(".main-container")
  .append("svg")
  .attr("class", "main-svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .style("cursor", "crosshair")
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);


d3.csv("https://api.coindesk.com/v1/bpi/historical/close.csv",

  d => {
    return {date: d3.timeParse("%Y-%m-%d")(d.Date), value: Math.floor(d.Close), volume: Math.floor(d.volume)}
  },


  data => {

    // quick function to show the most recent info in the info-box at the top
    const showMostRecentInfo = () => {
      d3.select(".chart-info__date")
        .text("");
      d3.select(".chart-info__price")
        .text(`Most recent price: $${data[data.length - 1].value}`);
      d3.select(".chart-info__volume")
        .text("");
    };


    let volume_url = "https://min-api.cryptocompare.com/data/exchange/histoday?tsym=USD&api_key=86cf65ef09473df5964e859710cbccbb0c12284cd4e5493023133a9f5035429f";

    // getting the volume data
    let xhReq = new XMLHttpRequest();
    xhReq.open("GET", volume_url, false);
    xhReq.send(null);
    let volume_data = JSON.parse(xhReq.responseText)["Data"];

    data.splice(data.length - 3, 3);

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < volume_data.length; j++) {
        let volume_data_date = new Date(new Date(volume_data[j]["time"] * 1e3).toISOString());

        if (getDateString(data[i].date) === getDateString(volume_data_date)) {
          data[i].volume = Math.floor(volume_data[j]["volume"]);
        }
      }
    }


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
      .domain([0, d3.max(data, d => d.value)])
      .range([height, 0]);
    svg.append("g")
      .classed('axis', true)
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
      .domain([0, d3.max(data, d => {
        return +d.volume;
      })])
      .range([height / 2, 0]);
    svg.append("g")
      .attr("transform", `translate(${width},${height / 2})`)
      .classed('axis-right', true)
      .call(d3.axisRight(y_volume));
    // appending the right y axis label
    svg.append("text")
      .attr("transform", "rotate(90)")
      .attr("y", 0 - width - margin.right + 5)
      .attr("x", 300)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Volume per day, USD");

    // appending the volume bars at the bottom
    let x_volume = d3.scaleBand()
      .rangeRound([0, width])
      .domain(data.map(d => d.date))
      .paddingInner(0)
      .paddingOuter(0);
    svg.append("g")
      .attr("transform", `translate(0, ${height / 2})`)
      .selectAll("bar")
      .data(data)
      .enter().append("rect")
      .style("fill", "steelblue")
      .attr("x", d => x_volume(d.date))
      .attr("width", x_volume.bandwidth())
      .attr("y", d => y_volume(d.volume))
      .attr("height", d => height / 2 - y_volume(d.volume));

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

    svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => {
        showMostRecentInfo();
        return focus.style('display', 'none');
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
      const d = data[Math.floor((Math.floor(bound(mouse[0], 0, width)) / 761) * data.length)];

      focus.attr('transform', `translate(${x(d.date)}, ${y(d.value)})`);
      focus.select('line.x')
        .attr('x2', -x(d.date));

      focus.select('line.y')
        .attr('y2', height - y(d.value));

      if (d.date) {
        d3.select(".chart-info__date")
          .text(`Date: ${d.date.getDate()} ${d.date.toLocaleString('default', {month: 'long'})} ${d.date.getFullYear()}`);
        d3.select(".chart-info__price")
          .text(`Price: $${d.value}`);
        d3.select(".chart-info__volume")
          .text(`Volume: $${d.volume}`)
      }

    }

  });
