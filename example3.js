// Set the dimensions and margins of the graph
const margin = { top: 20, right: 30, bottom: 40, left: 50 },
      width = 600 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

// Append the SVG object to the body of the page
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Parse the date / time
const parseTime = d3.timeParse("%Y-%m-%d");

// Load the data
d3.csv("path/to/your/mock_stock_data.csv").then(data => {
    // Format the data
    data.forEach(d => {
        d.Date = parseTime(d.Date);
        d.Price = +d.Price;
    });
// Get unique stock names for the dropdown
const stockNames = Array.from(new Set(data.map(d => d.Stock)));

// Populate the stock dropdown
const stockSelect = d3.select("#stock-select");
stockSelect.append("option").text("All").attr("value", "All");
stockNames.forEach(stock => {
    stockSelect.append("option").text(stock).attr("value", stock);
});

// Set the scales
const x = d3.scaleTime()
    .range([0, width]);

const y = d3.scaleLinear()
    .range([height, 0]);

// Add the x-axis
const xAxis = svg.append("g")
    .attr("transform", `translate(0,${height})`);

// Add the y-axis
const yAxis = svg.append("g");

// Add a tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip");

function updateChart(filteredData) {
    // Update the scales
    x.domain(d3.extent(filteredData, d => d.Date));
    y.domain([0, d3.max(filteredData, d => d.Price)]).nice();

    // Add the x-axis
    xAxis.transition().duration(1000).call(d3.axisBottom(x));

    // Add the y-axis
    yAxis.transition().duration(1000).call(d3.axisLeft(y));

    // Remove any existing lines
    svg.selectAll(".line").remove();

    // Group the data by stock
    const stocks = d3.group(filteredData, d => d.Stock);

    // Add a line for each stock
    const line = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.Price));

    stocks.forEach((values, key) => {
        svg.append("path")
            .datum(values)
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", d3.schemeCategory10[Array.from(stocks.keys()).indexOf(key)])
            .attr("stroke-width", 1.5)
            .attr("d", line)
            .append("title")
            .text(key);
    });

    // Add circles for each data point
    const circles = svg.selectAll("circle")
        .data(filteredData);

    circles.enter().append("circle")
        .attr("r", 4)
        .attr("cx", d => x(d.Date))
        .attr("cy", d => y(d.Price))
        .attr("fill", d => d3.schemeCategory10[Array.from(stocks.keys()).indexOf(d.Stock)])
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Stock: ${d.Stock}<br>Date: ${formatDate(d.Date)}<br>Price: $${d.Price}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    circles.exit().remove();
}

// Initial chart rendering
updateChart(data);

// Filtering functionality
d3.select("#filter-btn").on("click", () => {
    const selectedStock = stockSelect.property("value");
    const startDate = parseTime(d3.select("#start-date").property("value"));
    const endDate = parseTime(d3.select("#end-date").property("value"));

    let filteredData = data;

    if (selectedStock !== "All") {
        filteredData = filteredData.filter(d => d.Stock === selectedStock);
    }

    if (startDate && endDate) {
        filteredData = filteredData.filter(d => d.Date >= startDate && d.Date <= endDate);
    }

    updateChart(filteredData);
});
});
    // Group the data by stock
    const stocks = d3.group(data, d => d.Stock);

    // Set the scales
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.Date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Price)])
        .nice()
        .range([height, 0]);

    // Add the x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", margin.bottom - 5)
        .attr("fill", "#000")
        .text("Date");

    // Add the y-axis
    svg.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("fill", "#000")
        .text("Price");

    // Add a line for each stock
    const line = d3.line()
        .x(d => x(d.Date))
        .y(d => y(d.Price));

    stocks.forEach((values, key) => {
        svg.append("path")
            .datum(values)
            .attr("fill", "none")
            .attr("stroke", d3.schemeCategory10[Array.from(stocks.keys()).indexOf(key)])
            .attr("stroke-width", 1.5)
            .attr("d", line)
            .append("title")
            .text(key);
    });

    // Add a tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 4)
        .attr("cx", d => x(d.Date))
        .attr("cy", d => y(d.Price))
        .attr("fill", d => d3.schemeCategory10[Array.from(stocks.keys()).indexOf(d.Stock)])
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Stock: ${d.Stock}<br>Date: ${d3.timeFormat("%Y-%m-%d")(d.Date)}<br>Price: $${d.Price}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
};
