let margin = {top: 10, right: 50, bottom: 100, left: 50},
  width = 760,
  height = 400;

const svg = d3.select(".main-container")
  .append("svg")
  .attr("class", "main-svg")
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .style("cursor", "crosshair")
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

d3.csv("https://api.coindesk.com/v1/bpi/historical/close.csv",

  d => {
    return {date: d3.timeParse("%Y-%m-%d")(d.Date), value: Math.floor(d.Close)}
  },

  data => {

    data.splice(data.length - 3, 3);


    let x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);
    svg.append("g")
      .attr("transform", 'translate(0,' + height + ')')
      .call(d3.axisBottom(x))
      .classed('axis', true)
      .selectAll("text")
      .attr("transform", "translate(-10,10)rotate(-45)");

    let y = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d.value)])
      .range([height, 0]);
    svg.append("g")
      .classed('axis', true)
      .call(d3.axisLeft(y));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr("d", d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value))
      );

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
      .on('mouseout', () => focus.style('display', 'none'))
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

    console.log(data);

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
          .text(`Price: $${d.value}`)
      }

    }

  });