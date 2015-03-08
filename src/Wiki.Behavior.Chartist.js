/*
Behavior:  Chartist
    Implement a jspwiki behaviour supporting Chartist graphs.

    Checkout the great chartist library at http://gionkunz.github.io/chartist-js/index.html

Usage:
(start code)
%%chartist-line {
  high: 15,
  low: -5
}
|| Monday || Tuesday || Wednesday || Thursday || Friday
| 12| 9 | 7  | 8 |  5
| 2 | 1 | 3.5| 7 |  3
| 1 | 3 | 4  | 5 |  6
/%
(end)


*/

Wiki.add( "[class^=chartist]", function( element ){

/*
Function: grapOptions
    Read the chartist options, and encapsulate it in a hidden container dom element
*/
function grabOptions( element, container ){

    var el,
        fragment = new DocumentFragment();

    while ( (el = element.firstChild ) && ( el.nodeType==3 ) ){

        fragment.appendChild( el );

    }

    fragment = fragment.textContent.trim();

    if( fragment != "" ){

        container.slick( { text: fragment } ).inject( element, "top" );

    }
    return fragment;
}

/*
Function: evalOptions
    Validate and parse the options string, into a regular javascript object
*/
function evalOptions( options, labels, series ){

    if( options != "" ){

        try {

            return Function( "labels", "series", "return " + options)(); // jshint ignore:line

        } catch( err ) {

            console.log ( "Options eval err", err, options );
            return null;

        }
    }
}

/*
Function: getTableData
    Parse regular html table, and collect the LABELS and SERIES data-sets.
*/
function getTableData( table ){

    var rows = table.rows,
        tlen = rows.length,
        i, j, row, rlen,
        labels = undefined, series = [];

    for( i = 0; i < tlen; i++ ){

        row = Array.from( rows[i].cells );
        rlen = row.length;

        if( row[0].tagName.test( /TH/i ) ){

            //get LABELS
            labels = [];
            for( j = 0; j < rlen; j++ ){ labels[j] = row[j].innerHTML; }

        } else {

            //get SERIES ; convert to numbers
            for( j = 0; j < rlen; j++ ){ row[j] = + row[j].get("text"); }
            series.push(row);

         }
    }

    return series[0] ? { labels: labels, series: series } : null;

}


    var type = "chartist".sliceArgs(element)[0] || "line",  // line or bar or pie
        options = grabOptions( element, "span.chartist-options"),
        data,
        el;

    type = type.capitalize();
    if( !type.match( "Line|Bar|Pie" ) ) return;

    element.getElements( "table" ).each( function( table ){

        data =  getTableData( table );

        if( data ){

            el = ["div", ["div.ct-chart.ct-golden-section"]].slick().inject(table, "after");
            table.addClass("chartist-table");

            if( type == "Pie" ){ data.series = data.series[0]; }

            new Chartist[type]( el.getFirst(), data, evalOptions(options, data.labels, data.series ) );

        }

    });

});