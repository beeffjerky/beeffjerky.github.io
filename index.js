const canHeight = 800;
const canWidth = 800;
const marginWidth = 50;
const marginHeight = marginWidth;
const makeButton = "#makeButton";
const fuelButton = "#fuelButton";
const cylButton = "#cylButton";
const xs = d3.scaleLog().domain([10, 150]).range([0, canWidth-marginWidth-marginHeight]);
const xi = d3.scaleLinear().domain([0, 150]).range([0, 0]);
const ys = d3.scaleLog().domain([10, 150]).range([canHeight-marginWidth-marginHeight, 0]);
const colorScale = d3.scaleOrdinal();
const buttons = ['default', 'default', 'default'];
function bindOptions(name, options, data) {
    d3.select(name)
    .selectAll('myOptions')
       .data(options)
    .enter()
      .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; });
    d3.select(name).on("change", function(d) {
        // recover the option that has been chosen
        // run the updateChart function with this selected option
        update(data)
    });
}
function writeIntro(dataCount, makeCount, fuelCount, cylCount) {
    const intro = `In 2017 ${makeCount} manufacturers made ${dataCount} cars with ${fuelCount} fuel types and ${cylCount} engine cylinder configurations.`
    d3.select('#intro').text(intro);
}

function writeIntroUpdate(dataCount, make, makeCount, fuel, fuelCount, cyl, cylCount) {
    intro = 'In 2017 ';
    if (make == 'default') {
        intro += ` ${makeCount} manufacturers made ${dataCount} car(s) `
    } else {
        intro += ` ${make} made ${dataCount} car(s) `
    }
    if (fuel == 'default' ) {
        intro += ` with ${fuelCount} fuel types`
    } else {
        intro += ` with ${fuel} engines`
    }
    if (cyl == 'default') {
        intro += ` and in ${cylCount} type(s) of engine cylinder configurations.`
    } else {
        intro += ` in a ${cyl} cylinder engine configuration`
    }
    d3.select('#intro').text(intro);
}

function updateCsv(updateData, notData) {
    d3.select('svg')
    .selectAll('circle')
    .remove()

    d3.select('svg')
    .select('#inplot')
    .selectAll('circle')
    .data(updateData)
    .enter()
    .append('circle')
    .attr('cx', function(d,i) {
        return xi(parseInt(d.AverageCityMPG));
    })
    .attr('cy', function(d,i) {
        return ys(parseInt(d.AverageHighwayMPG));
    })
    .attr('r', function(d,i) {
    return parseInt(d.EngineCylinders)/3 + 4;
    })
    .attr('fill', function(d,i){
        return colorScale(d.Fuel);
    }).attr('opacity', notData.length == 0 ? 0.8 : 1)
    .style("stroke", "black");;

    d3.select('svg')
    .select('#outplot')
    .selectAll('circle')
    .data(notData)
    .enter()
    .append('circle')
    .attr('cx', function(d,i) {
        return xi(parseInt(d.AverageCityMPG));
    })
    .attr('cy', function(d,i) {
        return ys(parseInt(d.AverageHighwayMPG));
    })
    .attr('r', function(d,i) {
    return parseInt(d.EngineCylinders)/3 + 4;
    })
    .attr('fill', function(d,i){
        return colorScale(d.Fuel);
    }).attr('opacity', .15);

    d3.select('svg').selectAll("circle")
    .transition()
    .delay(function(d,i){return(i*3)})
    .duration(2000)
    .attr("cx", function (d, i ) { return xs(parseInt(d.AverageCityMPG)); } )
    .attr("cy", function (d, i) { return ys(parseInt(d.AverageHighwayMPG)); } )
}

// A function that update the chart
function update(data) {
    const make = d3.select(makeButton).property("value");
    const fuel = d3.select(fuelButton).property("value");
    const cyl = d3.select(cylButton).property("value");

    const updateData = [];
    const notData = [];

    data.forEach(d => {
        if ((d.Make == make || make == "default") && (d.Fuel == fuel || fuel == "default") && (d.EngineCylinders == cyl || cyl == "default")) {
            updateData.push(d);
        } else {
            notData.push(d);
        }
    })

    const fuelSet = new Set()
    const cylSet = new Set()
    const makeSet = new Set()

    updateData.forEach(car => {
        fuelSet.add(car.Fuel);
        cylSet.add(parseInt(car.EngineCylinders));
        makeSet.add(car.Make);
    });

    writeIntroUpdate(updateData.length, make, Array.from(makeSet).length, fuel, Array.from(fuelSet).length, cyl, Array.from(cylSet).length)
    updateCsv(updateData, notData);
    // Give these new data to update line
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

    writeIntro(data.length, makeArray.length, fuelArray.length, cylArray.length);
    bindOptions(makeButton, makeArray, data);
    bindOptions(fuelButton, fuelArray, data);
    bindOptions(cylButton, cylArray.sort(function d(a,b){return a-b}), data);

    var ya = d3.axisLeft(ys)
        .tickValues([10, 20, 50, 100]).tickFormat(function (d) {
            return ys.tickFormat(4,d3.format(",d"))(d)
    });
    var xa = d3.axisBottom(xs)
        .tickValues([10, 20, 50, 100]).tickFormat(function (d) {
            return xs.tickFormat(4,d3.format(",d"))(d)
    });

    d3.select('svg').append("text")             
    .attr("transform",
          "translate(" + (canWidth/2) + " ," + 
                         (canHeight - marginHeight + 30) + ")")
    .style("text-anchor", "middle")
    .text("AverageCityMPG");

    d3.select('svg').append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 )
      .attr("x",0 - (canHeight / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("AverageHighwayMPG");   

    
    colorScale.domain(fuelArray).range(["blue", "green", "pink", "brown", "orange"])
    d3.select('svg')
    .attr('width', canWidth).attr('height', canHeight)
    .append('g').attr("id",'inplot')
    .attr('transform','translate(50,50)')
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', function(d,i) {
        return xi(parseInt(d.AverageCityMPG));
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

    d3.select('svg')
    .append('g').attr("class", "myXaxis")
    .attr('transform',`translate(${marginWidth}, ${marginHeight})`)
    .call(ya)
    d3.select('svg')
    .append('g')
    .attr('transform',`translate(${marginWidth}, ${canHeight-marginHeight})`)
    .call(xa)

    d3.select('svg').selectAll("circle")
    .transition()
    .delay(function(d,i){return(i*3)})
    .duration(2000)
    .attr("cx", function (d, i ) { return xs(parseInt(d.AverageCityMPG)); } )
    .attr("cy", function (d, i) { return ys(parseInt(d.AverageHighwayMPG)); } )

    d3.select('svg')
    .attr('width', canWidth).attr('height', canHeight)
    .append('g').attr("id",'outplot')
    .attr('transform','translate(50,50)')

    d3.select('#outro').text(`In 2017 car manufacturers made cars of varying fuel efficiency. From the scatter plot, 
    it can be seen that electric cars were extremely fuel efficient at the time and beat out the cars with other engine types.
    Furthermore it is shown that gasoline and diesel cars perform similarly and engines with more cylinders as indicated by the circle radii perform worse`)
}
