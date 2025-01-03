const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"

fetch(url)
    .then(response => response.json())
    .then(data => {
        const dataSet = data.monthlyVariance
        const baseTemp = data.baseTemperature;
        console.log(data);

        const width = 1200;
        const height = 400;
        const margin = { left: 60, right: 10, top: 20, bottom: 30 }

        const years = Array.from(new Set(dataSet.map(d => d.year))).map(String);
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const svg = d3.select("#heatmap")
            .attr("width", width)
            .attr("height", height)
            .style("background-color", "orange")

        const xScale = d3.scaleBand()
            .domain(years)
            .range([margin.left, width - margin.right]);

        const yScale = d3.scaleBand()
            .domain(d3.range(0, 12))
            .range([height - margin.bottom, margin.top]);

        const xAxis = d3.axisBottom(xScale)
            .tickValues(years.filter(year => year % 10 === 0));

        const yAxis = d3.axisLeft(yScale)
            .tickFormat(d => months[d]);

        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(xAxis);

        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(yAxis);

        const legendColorScale = d3.scaleQuantize()
            .domain(d3.extent(dataSet, d => d.variance))
            .range([
                "blue",
                "dodgerblue",
                "lightblue",
                "lightyellow",
                "lightcoral",
                "ORANGERED",
                "red",
                ]);
        const colorScale = legendColorScale;

        svg.selectAll("rect")
            .data(dataSet)
            .enter()
            .append("rect")
            .attr("x", d => xScale(String(d.year)))
            .attr("y", d => yScale(d.month - 1))
            .attr("data-month", d => d.month - 1)
            .attr("data-year", d => d.year)
            .attr("data-temp", d => baseTemp + d.variance)
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .style("fill", d => colorScale(d.variance))
            .attr("class", "cell");

        const tooltip = d3.select("body").append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("background-color", "lightgray")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("visibility", "hidden");

        svg.selectAll("rect")
            .on("mouseover", (event, d) => {
                tooltip.style("visibility", "visible")
                    .style("top", `${event.pageY + 10}px`)
                    .style("left", `${event.pageX + 10}px`)
                    .html(`Year: ${d.year}<br>Month: ${months[d.month - 1]}<br>Variance: ${d.variance}`);

                d3.select(event.target)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2);

            })
            .on("mouseout", (event) => {
                tooltip.style("visibility", "hidden");

                d3.select(event.target)
                    .attr("stroke", "none")
                    .attr("stroke-width", 0);
            });

        const legendWidth = 400;
        const legendHeight = 20;

        // Create a group for the legend
        const legendGroup = d3.select("#legend")
            .attr("width", legendWidth)
            .attr("height", legendHeight + 40)
            .append("g")
            .attr("id", "legend");

        // Width of each rectangle in the legend
        const rectWidth = legendWidth / legendColorScale.range().length;

        // Create the color bars in the legend
        legendGroup.selectAll("rect")
            .data(legendColorScale.range())
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * rectWidth)
            .attr("y", 0)
            .attr("width", rectWidth)
            .attr("height", legendHeight)
            .style("fill", d => d);

        const legendScale = d3.scaleLinear()
            .domain(d3.extent(dataSet, d => d.variance + baseTemp))
            .range([0, legendWidth]);

        const xAxis2 = d3.axisBottom(legendScale)
            .ticks(legendColorScale.range().length)
            .tickFormat(d3.format(".2f"));

        legendGroup.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .call(xAxis2);

    });