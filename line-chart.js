let margin = {top: 10, right: 0, bottom: 0, left: 0},
  width = 760,
  height = 500;

const svg = d3.select(".main-container")
  .append("svg")
  .attr("class", "main-svg")
  .attr("width", width)
  .attr("height", height)
  .style("cursor", "crosshair")
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

d3.csv("https://api.coindesk.com/v1/bpi/historical/close.csv",

  d => {
    return {date: d3.timeParse("%Y-%m-%d")(d.Date), value: d.Close}
  },

  data => {


    let x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);

    let y = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d.value)])
      .range([height, 0]);

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
      // .on('mouseover', () => focus.style('display', null))
      // .on('mouseout', () => focus.style('display', 'none'))
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

      const x0 = Math.floor(bound(mouse[0], 0, width));
      const i = Math.floor((x0 / 760) * data.length) - 1;
      const d0 = data[i - 1], d1 = data[i];

      const d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      focus.attr('transform', `translate(${x(d.date)}, ${y(d.value)})`);
      // focus.select('line.x')
      //   .attr('x2', -x(d.date));

      focus.select('line.y')
        .attr('y2', height - y(d.value));

      if (d.date) {
        d3.select(".chart-info")
          .text(d.date + ": $" + d.value)
      }

    }

  });