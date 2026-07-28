const margin = { top: 20, right: 120, bottom: 40, left: 220 };
const width = 1200;
const height = 900;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const platformColors = {
  YouTube: "#ffe44d",
  Facebook: "#55558d",
  Twitter: "#ffffff",
  Instagram: "#9ccad7"
};

const platformFields = {
  YouTube: "youtube",
  Facebook: "facebook",
  Twitter: "twitter",
  Instagram: "instagram"
};

d3.csv("social.csv").then((data) => {
  data.forEach((d) => {
    d.Artist = d.id.trim();

    Object.entries(platformFields).forEach(([platform, field]) => {
      d[platform] = +d[field] / 1000000;
    });

    d.Total = +d.total / 1000000;
  });

  const maxMillions = d3.max(data, (d) => d3.max(Object.keys(platformFields), (platform) => d[platform]));
  const maxDomain = Math.max(150, Math.ceil(maxMillions / 10) * 10);

  const x = d3.scaleLinear()
    .domain([0, maxDomain])
    .range([margin.left, width - margin.right]);

  const y = d3.scalePoint()
    .domain(data.map((d) => d.Artist))
    .range([margin.top, height - margin.bottom])
    .padding(0.6);

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .call(
      d3.axisBottom(x)
        .tickValues(d3.range(20, maxDomain + 1, 20))
        .tickSize(-(height - margin.top - margin.bottom))
        .tickFormat((d) => d + "M")
    );

  svg.selectAll(".hline")
    .data(data)
    .enter()
    .append("line")
    .attr("x1", margin.left)
    .attr("x2", width - margin.right)
    .attr("y1", (d) => y(d.Artist))
    .attr("y2", (d) => y(d.Artist))
    .attr("stroke", "#aaa");

  svg.selectAll(".artist")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "artist")
    .attr("x", margin.left - 20)
    .attr("y", (d) => y(d.Artist) + 6)
    .attr("text-anchor", "end")
    .text((d) => d.Artist);

  svg.selectAll(".total")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "total")
    .attr("x", width - 90)
    .attr("y", (d) => y(d.Artist) + 6)
    .text((d) => d.Total.toFixed(1) + "M");

  svg.selectAll(".ticks")
    .data(d3.range(20, maxDomain + 1, 20))
    .enter()
    .append("text")
    .attr("x", (d) => x(d))
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .style("font-weight", "bold")
    .text((d) => d + "M");

  Object.entries(platformColors).forEach(([platform, color]) => {
    svg.selectAll(`.${platform.toLowerCase()}`)
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d[platform]))
      .attr("cy", (d) => y(d.Artist))
      .attr("r", 9)
      .attr("fill", color)
      .attr("class", `dot ${platform.toLowerCase()}`);
  });
});