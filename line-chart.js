let margin = {top: 10, right: 0, bottom: 0, left: 0},
  width = 760 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

const svg = d3.select("body")
  .append("svg")
  .attr("class", "main-svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
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
      .domain([0, d3.max(data, d => +d.value
      )])
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
      .attr('class', 'focus')
      .style('display', 'none');

    focus.append('circle')
      .attr('r', 4.5);

    focus.append('line')
      .classed('x', true);

    focus.append('line')
      .classed('y', true);

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


    function getMousePosition(mouse) {
      // return `(${Math.floor(bound(mouse[0], 0, width))}, ${Math.floor(bound(mouse[1], 0, height))})`;
      return Math.floor(bound(mouse[0], 0, width));
    }

    function updateMousePosition(target) {
      let mouse = d3.mouse(target);

      const x0 = getMousePosition(mouse);
      const i = Math.floor((x0 / 760) * 34);
      const d0 = data[i - 1], d1 = data[i];

      const d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      focus.attr('transform', `translate(${x(d.date)}, ${y(d.value)})`);
      focus.select('line.x')
        .attr('x1', 0)
        .attr('x2', -x(d.date))
        .attr('y1', 0)
        .attr('y2', 0);

      focus.select('line.y')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', height - y(d.value));

      d3.select(".chart-info")
        .text(getMousePosition(mouse))
    }

  });