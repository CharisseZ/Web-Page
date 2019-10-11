/**
 * dashboard - function for generating multiple charts
 * @param {*} id 
 * @param {*} Dataset 
 */

const parseTime = d3.timeParse("%b,%Y");
const parseYear = d3.timeParse("%Y");

function dashboard(countrydata, element = false) {

    var barColor = "steelblue";

    function segColor(d) {
        d3.scaleSequential(d3.interpolateBuPu)
            .domain([0, 1000])
    }


    // control target type
    function histGram(targetdata) {
        var Hist = {},
            histogram = {
                t: 60,
                r: 0,
                b: 30,
                l: 0
            };
        (histogram.w = 500 - histogram.l - histogram.r), (histogram.h = 300 - histogram.t - histogram.b);

        function fixt(targetdata) {
            return d3.nest().key(function (d) { return d.key[2] }).rollup(function (l) { return d3.sum(l,k=>k.value) }).entries(targetdata);
        }

        let cleaned = fixt(targetdata);
        var Histsvg = d3
            .select("#hist")
           
            .append("g")
             .attr("transform", "translate(" + `${histogram.l + 1000}` + "," + `${-histogram.t}` + ")")

        // create function for x-axis mapping.
        var x = d3.scaleBand()
            .rangeRound([0, histogram.w], 0.1)
            .domain(
                cleaned.map(function (d) {
                    return d.key;
                })
            );

        // Add x-axis to the histogram svg.
        Histsvg
            .append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + histogram.h + ")")
            .call(
                d3.axisBottom(x)
            );

        // Create function for y-axis map.
        var y = d3.scaleLinear()
            .range([histogram.h, 0])
            .domain([
                0,
                d3.max(cleaned, function (d) {
                   
                    return d.value;
                })
            ]);

        // Create bars for histogram to contain rectangles anewdata freq labels.
        var bars = Histsvg
            .selectAll(".bar")
            .data(cleaned)
            .enter()
            .append("g")
            .attr("class", "bar");

        //create the rectangles.
        bars
            .append("rect")
            .attr("x", function (d) {
                return x(d.key);
            })
            .attr("y", function (d) {
                return y(d.value);
            })
            .attr("width", x.bandwidth())
            .attr("height", function (d) {
                return histogram.h - y(d.value);
            })
            .attr("fill", barColor)
            .on("mouseover", mouseover) // mouseover is defined below.
            .on("mouseout", mouseout); // mouseout is defined below.

        //Create the frequency labels above the rectangles.
        bars
            .append("text")
            .text(function (d) {
                return TargetMap.get(d.key);
            })
            .attr("x", function (d) {
                
                return x(d.key) + x.bandwidth() / 2;
            })
            .attr("y", function (d) {
                return y(d.value) - 5;
            })
            .attr("text-anchor", "middle");

        function mouseover(d) {
           
            var st = Dataset.filter(function (s) {
                return s.key[2] == d.key;
            });
               
            // call update functions of pie-chart anewdata legend.
            pieC.update(st);
            leg.update(st);
        }

        function mouseout() {
           
            pieC.update(Dataset);
            leg.update(Dataset);
        }

        // create function to update the bars. This will be used by pie-chart.
        Hist.update = function (newdata) {
            newd = fixt(newdata);
            y.domain([
                0,
                d3.max(newd, function (d) {
                    return d.value;
                })
            ]);

            // Attach the new data to the bars.
            var bars = Histsvg.selectAll(".bar").data(newd);

            // transition the height anewdata color of rectangles.
            bars
                .select("rect")
                .transition()
                .duration(500)
                .attr("y", function (d) {
                    return y(d.value);
                })
                .attr("height", function (d) {
                    return histogram.h - y(d.value);
                })
                .attr("fill", "blue");

            // transition the frequency labels location anewdata change value.
            bars
                .select("text")
                .transition()
                .duration(500)
                .text(function (d) {
                    return d3.format(",")(d.value);
                })
                .attr("y", function (d) {
                    return y(d.value) - 5;
                });
        };
        return Hist;
    }

    // control attack type


    function pieChart(pieData) { // create svg for pie chart.
        let pieC = {},
            pie = {
                width: 400,
                height: 400,
                radius: 150

            };
        function fixp(pieData) { return d3.nest().key(function (d) { return d.key[1] }).rollup(function (l) { return d3.sum(l,k=>k.value) }).entries(pieData); }
        pied=fixp(pieData)
        format = d3.format(",")
      const color=d3.scaleOrdinal()
      .domain(pied.map(d=>d.key))
            .range(d3.quantize(t => d3.interpolateSpectral(t + 0.12), pied.length).reverse())
      
      
        var piesvg =
            d3.select("#pie")
                .attr("transform", "translate(" + `${(600 + pie.width)}` + "," + `${(-600) / 2}` + ")")
                .append("g");
            

        // create function to draw the arcs of the pie slices.
        var arc = d3
            .arc()
            .outerRadius(pie.radius)
            .innerRadius(20);

        // create a function to compute the pie slice angles.
        var piecurve = d3
            .pie()
            .sort(null)
            .value(function (d) {

                return d.value;
            });


       
        // Draw the pie slices.
        piesvg
            .selectAll("path.outer")
            .data(piecurve(pied))
            .enter()
            .append("path")
            .attr("d", arc)
            .each(function (d) {
                this._current = d;
            })
            .style("fill", function (d, i) {
               return "blue"
            })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);












        // create function to update pie-chart. This will be used by histogram.
        pieC.update = function (newdata) {
            newdata = fixp(newdata);
            piesvg
                .selectAll("path.outer")
                .classed("updating", true)
                .data(piecurve(newdata))
                .transition()
                .duration(200)
                .attrTween("d", arcTween);



        };
        // Utility function to be called on mouseover a pie slice.
        function mouseover(d) {
            // call the update function of histogram with new data.
            Hist.update(
                Dataset.filter(function (v) {
                    return v.key[1] == d.key;
                }),
               
            );
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d) {
            // call the update function of histogram with all data.
            Hist.update(Dataset);
        }
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function (t) {
                return arc(i(t));
            };
        }
        return pieC;
    }


    // function to hanewdatale legend.
    function legend(lD) {
        var leg = {};
        attacklist = d3.map(lD, function (d) {
            return d.key[1];
        }).keys()
        targetlist = d3.map(lD, function (d) {
            return d.key[2];
        }).keys()
        // create table for legend.
        var legend = d3
            .select("#legend")
            .append("table")
            .attr("class", "legend");

        // create one row per segment.
        var tr = legend
            .append("tbody")
            .selectAll("tr")
            .data(targetlist)
            .enter()
            .append("tr");

        // create the first column for each segment.
        tr.append("td")
           
            .attr("width", "16")
            .attr("height", "16")
            .append("rect")
            .attr("width", "16")
            .attr("height", "16")
            .attr("fill", function (d,i) {
                return segColor(i);
            });

        // create the seconewdata column for each segment.
        tr.append("td").text(function (d) {
            return TargetMap.get(d.toString());
        });

        // create the third column for each segment.
       var at = legend
            .append("tbody")
            .selectAll("tr")
            .data(attacklist)
            .enter()
            .append("tr");

        // create the first column for each segment.
        at.append("td")
            
            .attr("width", "16")
            .attr("height", "16")
            .append("rect")
            .attr("width", "16")
            .attr("height", "16")
            .attr("fill", function (d,i) {
                return segColor(i);
            });

        // create the seconewdata column for each segment.
        at.append("td").text(function (d) {
            return AttackMap.get(d);
        });

        // create the fourth column for each segment.
        at.append("td")
            .attr("class", "legendPerc")
            .text(function (d) {
                return getlegend(d, lD);
            });

        // Utility function to be used to update the legend.
        leg.update = function (newdata) {
            // update the data attached to the row elements.
            

        };

        function getlegend(d, aD) {
            // Utility function to compute percentage.
            return d3.format("%")(
                d.value /
                d3.sum(
                    aD.map(function (v) {
                        return v.value;
                    })
                )
            );
        }

        return leg;
    }
    
    // calculate total frequency by segment for all state.

    // calculate total frequency by state for all segment.

    //initiate multiple chart

    //BG = barsgroup(countrydata),
    let Dataset = REDUCE(countrydata),
    BG = barsgroup(countrydata);
    pieC = pieChart(Dataset);
    Hist = histGram(Dataset);
    leg = legend(Dataset);



    // create the legend.
}