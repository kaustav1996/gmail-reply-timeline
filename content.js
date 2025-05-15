(function () {
  const dummyData = [
    {
      sender: "Alice",
      time: new Date("2025-05-10T09:15:00"),
      photo: "https://i.pravatar.cc/40?u=alice"
    },
    {
      sender: "Charlie",
      time: new Date("2025-05-11T13:30:00"),
      photo: "https://i.pravatar.cc/40?u=charlie"
    },
    {
      sender: "Bob",
      time: new Date("2025-05-10T14:45:00"),
      photo: "https://i.pravatar.cc/40?u=bob"
    },
    {
      sender: "Charlie",
      time: new Date("2025-05-11T11:30:00"),
      photo: "https://i.pravatar.cc/40?u=charlie"
    }
  ];

  const container = document.createElement("div");
  container.id = "reply-timeline";
  container.style = `
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 999999;
    background: #fff;
    padding: 12px;
    border: 1px solid #ccc;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    border-radius: 10px;
    font-family: sans-serif;
  `;
  container.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 6px;">📬 Reply Timeline</div>
    <svg id="timeline-chart" width="520" height="280"></svg>
  `;
  document.body.appendChild(container);

  const tooltip = document.createElement("div");
  tooltip.className = "timeline-tooltip";
  tooltip.style = `
    position: fixed;
    background: rgba(0,0,0,0.8);
    color: #fff;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 13px;
    pointer-events: none;
    z-index: 1000000;
    display: none;
    font-family: sans-serif;
  `;
  document.body.appendChild(tooltip);

  drawTimeline(dummyData);

  function drawTimeline(data) {
    const svg = d3.select("#timeline-chart");
    svg.selectAll("*").remove();
  
    const width = 520;
    const height = 280;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.time))
      .range([margin.left, width - margin.right]);
  
    const yScale = d3.scaleLinear()
      .domain([0, 24])
      .range([height - margin.bottom, margin.top]);
  
    const xAxis = d3.axisBottom(xScale).ticks(5).tickSize(-height + margin.top + margin.bottom);
    const yAxis = d3.axisLeft(yScale).ticks(6).tickSize(-width + margin.left + margin.right);
  
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("line")
      .attr("stroke", "#eee");
  
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .selectAll("line")
      .attr("stroke", "#eee");
  
    svg.selectAll("path.domain").attr("stroke", "#aaa");
    svg.selectAll(".tick text").attr("fill", "#444");
  
    // 🎨 Create a color map based on sender
    const colorScale = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.sender))])
      .range(d3.schemeCategory10);
  
    // Draw colorful vertical lines
    svg.selectAll("line.reply-line")
      .data(data)
      .enter()
      .append("line")
      .attr("class", "reply-line")
      .attr("x1", d => xScale(d.time))
      .attr("y1", d => yScale(d.time.getHours()))
      .attr("x2", d => xScale(d.time))
      .attr("y2", height - margin.bottom)
      .attr("stroke", d => colorScale(d.sender))
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "2,2")
      .on("mouseover", (event, d) => {
        tooltip.innerHTML = `<b>${d.sender}</b><br>${d.time.toLocaleString()}`;
        tooltip.style.display = "block";
      })
      .on("mousemove", (event) => {
        tooltip.style.left = `${event.clientX - tooltip.offsetWidth - 12}px`;
        tooltip.style.top = `${event.clientY - 20}px`;
      })
      .on("mouseout", () => {
        tooltip.style.display = "none";
      });
  
    // 🖼️ Profile icons with hover tooltip
    svg.selectAll("image")
      .data(data)
      .enter()
      .append("image")
      .attr("xlink:href", d => d.photo)
      .attr("x", d => xScale(d.time) - 12)
      .attr("y", d => yScale(d.time.getHours()) - 12)
      .attr("width", 24)
      .attr("height", 24)
      .attr("clip-path", "circle(12px at center)")
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        tooltip.innerHTML = `<b>${d.sender}</b><br>${d.time.toLocaleString()}`;
        tooltip.style.display = "block";
      })
      .on("mousemove", (event) => {
        tooltip.style.left = `${event.clientX - tooltip.offsetWidth - 12}px`;
        tooltip.style.top = `${event.clientY - 20}px`;
      })
      .on("mouseout", () => {
        tooltip.style.display = "none";
      });
  }
})();