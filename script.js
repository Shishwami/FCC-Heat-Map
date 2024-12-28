const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"

fetch(url)
    .then(response => response.json())
    .then(data => {
        const dataSet = data.monthlyVariance

        console.log(dataSet);

        const width = 1000;
        const height = 400;
        const margin = { left: 70, right: 50, top: 50, bottom: 50 }

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
            .attr("transform", `translate(${margin.left}, 0)`) // Correct position
            .call(yAxis);



        const colorScale = d3.scaleSequential(d3.interpolateCool)
            .domain(d3.extent(dataSet, d => d.variance));

        svg.selectAll("rect")
            .data(dataSet)
            .enter()
            .append("rect")
            .attr("x", d => xScale(String(d.year)))
            .attr("y", d => yScale(d.month - 1))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(d.variance))
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

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .attr("id", "title")
            .text("Monthly Global Temperature Variance")
            .style("font-size", "20px")
            .style("font-weight", "bold");

    });