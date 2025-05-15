(function () {
  // 🛡️ Safeguard: don't run if disabled
  if (window.__timelineEnabled === false) return;

  // 🔁 Default enable
  if (typeof window.__timelineEnabled === "undefined") {
    window.__timelineEnabled = true;
  }

  const observeGmailThread = () => {
    const target = document.body;
    const config = { childList: true, subtree: true };
    let timeout = null;

    const callback = () => {
      if (window.__timelineEnabled === false) return;

      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const messages = document.querySelectorAll('.adn, .ads');
        if (messages.length > 0) {
          parseThread(messages);
        } else {
          removeTimeline();
          showNoThread();
        }
      }, 1000);
    };

    const observer = new MutationObserver(callback);
    observer.observe(target, config);
  };

  const parseThread = (messages) => {
    const data = [];

    messages.forEach(msg => {
      const sender = msg.querySelector('span.gD')?.getAttribute('email') || msg.querySelector('span.gD')?.innerText;
      const timeStr = msg.querySelector('span.g3')?.getAttribute('title');
      const time = new Date(timeStr);
      const photo = msg.querySelector('img.ajn')?.src || 'https://via.placeholder.com/24';

      if (sender && !isNaN(time.getTime())) {
        data.push({ sender, time, photo });
      }
    });

    if (data.length > 0) {
      removeTimeline();
      injectTimeline(data);
    } else {
      removeTimeline();
      showNoThread();
    }
  };

  const removeTimeline = () => {
    document.getElementById("reply-timeline")?.remove();
    document.querySelector(".timeline-tooltip")?.remove();
  };

  const showNoThread = () => {
    removeTimeline();
    const div = document.createElement("div");
    div.id = "reply-timeline";
    div.style = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 999999;
      background: #fff;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      font-family: sans-serif;
    `;
    div.innerHTML = `
      <div style="position: relative;">
        ⚠️ No Gmail thread open
        <span id="timeline-close" style="position:absolute; top:0; right:0; cursor:pointer; padding:4px;">✖</span>
      </div>
    `;
    document.body.appendChild(div);
    const closeBtn = document.getElementById("timeline-close");
    if (closeBtn) {
      closeBtn.onclick = () => {
        window.__timelineEnabled = false;
        removeTimeline();
      };
    }
  };

  const injectTimeline = (data) => {
    removeTimeline();
    const container = document.createElement("div");
    container.id = "reply-timeline";
    container.style = `
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 999999;
  background: #fff;
  padding: 12px;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  font-family: sans-serif;
  background-clip: padding-box;
  border: 4px solid transparent;
  background-origin: border-box;
  background-image:
    linear-gradient(#fff, #fff),
    linear-gradient(135deg, #00c6ff, #0072ff, #8e2de2);
  background-position: 0% 50%;
  background-size: 300% 300%;
  animation: border-flow 6s ease infinite;
`;
    container.innerHTML = `
      <div style="position: relative; font-weight:bold;">
        📬 Reply Timeline
        <span id="timeline-close" style="position:absolute; top:4px; right:8px; font-size:16px; font-weight:bold; cursor:pointer; opacity:0.6;" title="Close">✖</span>
      </div>
      <svg id="timeline-chart" width="520" height="280"></svg>
    `;
    document.body.appendChild(container);
    const style = document.createElement('style');
style.textContent = `
@keyframes border-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;
document.head.appendChild(style);

    const closeBtn = document.getElementById("timeline-close");
    if (closeBtn) {
      closeBtn.onclick = () => {
        window.__timelineEnabled = false;
        removeTimeline();
      };
      closeBtn.onmouseenter = e => e.target.style.opacity = 1;
      closeBtn.onmouseleave = e => e.target.style.opacity = 0.6;
    }
    const tooltip = document.createElement("div");
    tooltip.className = "timeline-tooltip";
    tooltip.style = `
      position: fixed;
      background: rgba(0,0,0,0.85);
      color: white;
      padding: 6px 10px;
      font-size: 13px;
      border-radius: 6px;
      display: none;
      pointer-events: none;
      z-index: 1000000;
    `;
    document.body.appendChild(tooltip);

    drawTimeline(data, tooltip);
  };

  const drawTimeline = (data, tooltip) => {
    const svg = d3.select("#timeline-chart");
    svg.selectAll("*").remove();

    const width = 520;
    const height = 280;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };

    const originalX = d3.scaleTime()
      .domain(d3.extent(data, d => d.time))
      .range([margin.left, width - margin.right]);

    let xScale = originalX.copy();
    const yScale = d3.scaleLinear().domain([0, 24]).range([height - margin.bottom, margin.top]);

    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale).ticks(6).tickSize(-width + margin.left + margin.right);

    const xAxisG = svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis)
      .selectAll("line").attr("stroke", "#eee");

    svg.selectAll("path.domain").attr("stroke", "#aaa");
    svg.selectAll(".tick text").attr("fill", "#444");

    const colorScale = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.sender))])
      .range(d3.schemeSet2);

    const content = svg.append("g").attr("class", "zoom-layer");

    function render() {
      content.selectAll("*").remove();

      content.selectAll("line")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", d => xScale(d.time))
        .attr("y1", d => yScale(d.time.getHours()))
        .attr("x2", d => xScale(d.time))
        .attr("y2", height - margin.bottom)
        .attr("stroke", d => colorScale(d.sender))
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "2,2");

      content.selectAll("image")
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
        .on("mouseout", () => tooltip.style.display = "none");
    }

    render();

    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[margin.left, 0], [width - margin.right, height]])
      .extent([[margin.left, 0], [width - margin.right, height]])
      .on("zoom", (event) => {
        const transform = event.transform;
        xScale = transform.rescaleX(originalX);
        xAxisG.call(xAxis.scale(xScale));
        render();
      });

    svg.call(zoom);
  };

  observeGmailThread();
})();