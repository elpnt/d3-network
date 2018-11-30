var width = 800,
    height = 800,
    radius = 5;

var svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function(d) { return d.id; }))
  .force("charge", d3.forceManyBody().strength(-90)) // repulsion strength
  .force("center", d3.forceCenter(width/2, height/2))
  .force("collision", d3.forceCollide().radius(radius)); // forbid nodes overwrapping

var jsonurl =
"https://gist.githubusercontent.com/velvetops/7b984f20e28f6baba02bcb8fa48faf93/raw/c80b13f75ee5fa1e86bb17291f135727a1d669a2/lesmiserables.json";

d3.json(jsonurl, function(error, graph) {
  if (error) throw error;

  var link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke", "#aaa")
    .attr("stroke-width", function(d) {
      return d.value / 5;
    });

  var node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
      .attr("r", function(d) {
        d.weight = link.filter(function(l) {
          return l.source == d.id || l.target == d.id;
        }).size();
        return radius + (d.weight / 2);
      })
      .attr("stroke", "gray")
      .attr("stroke-width", 2)
      .attr("fill", function(d) {
        return d3.schemeCategory10[d.group];
      })
    .call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));

  var title = svg.append("g")
    .selectAll("text")
    .data(graph.nodes)
    .enter().append("text")
    .text(node => node.id)
    .attr("font-size", 15)
    .attr("dx", radius + 2)
    .attr("dy", radius / 2)
    .attr("pointer-events", "none");

  simulation
    .nodes(graph.nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(graph.links);

  function ticked() {
    link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; })

    node
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });

    title
      .attr("x", function(d) { return d.x; })
      .attr("y", function(d) { return d.y; });
  }
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

