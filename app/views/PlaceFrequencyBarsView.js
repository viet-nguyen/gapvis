/*
 * Place Frequency Bar Chart View
 */
(function(gv) {
    var View = gv.View,
        state = gv.state;
    
    // View: BookTitleView (title and metadata)
    gv.PlaceFrequencyBarsView = View.extend({
        el: '#place-freq-bars-view',
        
        render: function() {
            var bh = 12,
                w = 250,
                lw = 100,
                spacing = 3,
                color = 'steelblue',
                hicolor = 'orange';
                
            var book = this.model,
                places = book.places.models.slice(0, 30),
                buckets = 50,
                frequency = function(d) { return d.get('frequency') },
                max = d3.max(places, frequency),
                x = d3.scale.linear()
                    .domain([0, max])
                    .range([0, w]),
                y = function(d, i) { return i * (bh + spacing) },
                bw = function(d) { return x(frequency(d)) };
                
            $(this.el).append('<h3>Top Places</h3>');
        
            var svg = d3.select(this.el)
              .append('svg:svg')
              .style('height', (bh + spacing) * places.length + 10);
            
            /*  
            svg.selectAll('rect')
                .data(places)
              .enter().append('svg:rect')
                .attr('x', lw)
                .attr('y', y)
                .attr('height', bh)
                .attr('width', bw)
                .style('fill', color);
            */
            
            var pages = book.pages,
                sidx = d3.scale.quantize()
                    .domain([0, pages.length])
                    .range(d3.range(0, buckets)),
                sx = d3.scale.linear()
                    .domain([0, buckets])
                    .range([0, w]);
                    
                places.forEach(function(place) {
                    if (!place.get('sparkData')) {
                        // make the sparkline data
                        var sdata = d3.range(0, buckets).map(d3.functor(0));
                        pages.each(function(p, pi) {
                            var pplaces = p.get('places'),
                                pidx = sidx(pi);
                            if (pplaces && pplaces.indexOf(place.id) >= 0) {
                                sdata[pidx]++;
                            }
                        });
                        place.set({ sparkData: sdata });
                    }
                });
                
                sparkMax = d3.max(places, function(d) { return d3.max(d.get('sparkData')) }),
                sy = d3.scale.linear()
                    .domain([0, sparkMax])
                    .range([0, bh]);
            
            var spark = svg.selectAll('g.spark')
                .data(places)
              .enter().append('svg:g')
                .attr('class', 'spark')
                .attr("transform", function(d, i) { return "translate(0," + y(d,i) + ")"; });
            
            spark.append('svg:line')
                .attr('x1', lw)
                .attr('x2', lw + w)
                .attr('y1', bh)
                .attr('y2', bh)
                .style('stroke', '#999')
                .style('stroke-width', .5);
                
            spark.each(function(place) {
                d3.select(this).selectAll('rect')
                    .data(function(d) { return d.get('sparkData') })
                  .enter().append('svg:rect')
                    .attr('y', function(d) { return bh - sy(d) })
                    .attr('x', function(d,i) { return sx(i) + lw })
                    .attr('width', w/buckets)
                    .attr('height', sy)
                    .style('fill', color)
                    .style('cursor', 'pointer')
                    .on('mouseover', function() {
                        d3.select(this).style('fill', hicolor)
                    })
                    .on('mouseout', function() {
                        d3.select(this).style('fill', color)
                    })
                    .on('click', function(d,i) {
                        var pageId = pages.at(~~((pages.length*i)/buckets)).id;
                        state.set({
                            placeid: place.id,
                            pageid: pageId,
                            topview: gv.BookReadingView
                        })
                    });
            });
                
            svg.selectAll('text.title')
                .data(places)
              .enter().append('svg:text')
                .attr('class', 'title')
                .style('fill', 'black')
                .style('font-size', '10px')
                .attr('x', lw - 8)
                .attr('y', y)
                .attr("dx", 3)
                .attr("dy", ".9em")
                .attr('text-anchor', 'end')
                .text(function(d) { return d.get('title') });
            
            svg.selectAll('text.freq')
                .data(places)
              .enter().append('svg:text')
                .attr('class', 'freq')
                .style('fill', 'black')
                .style('font-size', '10px')
                .attr('x', lw + w)
                .attr('y', y)
                .attr("dx", 3)
                .attr("dy", ".9em")
                .text(frequency);
                
              
            return this;
        },
        
    });
    
}(gv));