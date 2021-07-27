const canHeight = 600;
const canWidth = 600;
const marginWidth = 50;
const marginHeight = marginWidth;
const makeButton = "#makeButton";
const fuelButton = "#fuelButton";
const cylButton = "#cylButton";
const xs = d3.scaleLog().domain([10, 150]).range([0, canWidth-marginWidth-marginHeight]);
const ys = d3.scaleLog().domain([10, 150]).range([canHeight-marginWidth-marginHeight, 0]);
const colorScale = d3.scaleOrdinal();
function bindOptions(name, options) {
    d3.select(name)
    .selectAll('myOptions')
       .data(options)
    .enter()
      .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button
}
async function main(data) {
    const makeSet = new Set()
    const fuelSet = new Set()
    const cylSet = new Set()
    data.forEach(car => {
        makeSet.add(car.Make);
        fuelSet.add(car.Fuel);
        cylSet.add(parseInt(car.EngineCylinders));
    });
    makeArray = Array.from(makeSet);
    fuelArray = Array.from(fuelSet);
    cylArray = Array.from(cylSet);

    bindOptions(makeButton, makeArray);
    bindOptions(fuelButton, fuelArray);
    bindOptions(cylButton, cylArray.sort(function d(a,b){return a-b}));
    
    colorScale.domain(fuelArray).range(["blue", "green", "pink", "brown", "orange"])
    d3.select('svg')
    .attr('width', canWidth).attr('height', canHeight)
    .append('g')
    .attr('transform','translate(50,50)')
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', function(d,i) {
        return xs(parseInt(d.AverageCityMPG));
    })
    .attr('cy', function(d,i) {
        return ys(parseInt(d.AverageHighwayMPG));
    })
    .attr('r', function(d,i) {
    return parseInt(d.EngineCylinders)/3 + 4;
    })
    .attr('fill', function(d,i){
        return colorScale(d.Fuel);
    })
    .attr('opacity', .8)
    .style("stroke", "black");
    var ya = d3.axisLeft(ys)
            .tickValues([10, 20, 50, 100]);
    var xa = d3.axisBottom(xs)
            .tickValues([10, 20, 50, 100]);
    d3.select('svg')
    .append('g')
    .attr('transform',`translate(${marginWidth}, ${marginHeight})`)
    .call(ya)
    d3.select('svg')
    .append('g')
    .attr('transform',`translate(${marginWidth}, ${canHeight-marginHeight})`)
    .call(xa)
}
