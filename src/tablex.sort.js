/*
Class: TableX.Sort
    Adds ''click'' handlers to sort table columns.
    CSS classes are added to the header depending on the sort order.
    The data-type of each column is auto-recognized.

    Todo: add spinner while sorting

Credits:
    The originial implementation was inspired by the excellent javascript created by
    Erik Arvidsson. See http://webfx.eae.net/dhtml/sortabletable/sortabletable.html.
    The natural-Sort was inspired by an implement of Jim Palmer e.a.

*/
TableX.Sort = new Class({

    Implements: Options,

    options: {
        css: {
            sort: 'sort',
            atoz: 'up',
            ztoa: 'down'
        },
        hints: {
            sort: "Click to sort",
            atoz: "Ascending. Click to reverse",
            ztoa: "Descending. Click to reverse"
        }
    },

    initialize: function(table,options){

        this.setOptions(options).options;
        this.table = table = new TableX(table,{minSize:3});

        if( table ){
            table.table.rows[0].addEvent('click:relay(th)', this.sort.bind(this) );
            this.resetTH();
        }

    },

    resetTH: function(){

        var options = this.options;
        this.table.thead.set({'class': options.css.sort, title: options.hints.sort });

    },

    /*
    Function: sort
        Click event-handler, to perform a sort based on the clicked column header.

    */
    sort: function( event ){

        var table = this.table,
            rows = table.rows,
            th = event.target,
            options = this.options,
            hints = options.hints,
            css = options.css;
            sortAtoZ = th.hasClass(css.atoz);

        //console.log( ( sortAtoZ || th.hasClass(ztoa) ) ? "reverse" : "sort first time" );

        table.refresh( sortAtoZ || th.hasClass(css.ztoa) ?
            rows.reverse() :
            rows.sort( this.makeSortable(rows, table.thead.indexOf(th)) )
        );

        this.resetTH();
        sortAtoZ = sortAtoZ ? 'ztoa':'atoz';
        th.swapClass(css.sort,css[sortAtoZ]).set('title', hints[sortAtoZ]);

    },

    /*
    Function: makeSortable
        Parse the column and guess its data-type.
        Then convert all values according to that data-type.
        Cache the sortable values in rows[0-n].cache.
        Empty rows will sort based on the title attribute of the cells.

    Supported data-types:
        numeric - numeric value, with . as decimal separator
        date - dates as supported by javascript Date.parse
          See https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/Date/parse
        ip4 - ip addresses (like 169.169.0.1)
        euro - currency values (like £10.4, $50, €0.5)
        kmgt - storage values (like 2 MB, 4GB, 1.2kb, 8Tb)

    Arguments:
        rows - array of rows each pointing to a DOM tr element
            rows[i].data caches the converted data.
        column - index (0..n) of the processed column

    Returns:
        comparison function which can be used to sort the table
    */

    makeSortable: function(rows,column){

        console.log(rows.length,column);

        var sortable, cell, compareFn,
            cache = 'cache'; //name of the cache attribute on each row

        if( !rows[0][cache] || !rows[0][cache][column] ){

            //convert the column to an array of sortable values
            sortable = rows.map( function(row){
                cell = row.cells[column];
                return cell.getAttribute('data-sortby') || cell.get('text');
            }).makeSortable();
            compareFn = sortable.cmp;

            //now cache the sortable data in row.cache[column]
            rows.each( function(row, index){
                if( !row[cache] ){ row[cache]=[]; }
                //row.cache[column] = empty ? row.cells[column].get('title') : sortable[index];
                row[cache][column] = sortable[index];
            });

            this.cmp[column] =

            rows.cmp = function(a,b){
                return compareFn( a[cache][column], b[cache][column] );
            }

        }
        //rows.cmp = this.cmp[column];
        return rows;

    }
});





Array.implement({

    naturalSort:function(){

        var arr = this.makeSortable();  //to be cached
        return arr.sort( this.cmp ).map( function(item){ return item[1]; })

    },

    makeSortable:function(){

        var num = [], dmy=[], kmgt=[], nat=[],
            val, i, len = this.length, result=[],

            //split string in sequences of digits, separated by ., and alpha-strings
            reNAT = /(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g,
            //convert strings to numbers if possible
            scalars = function(arr){
                var val, i=0;
                while( val = arr[i] ){ arr[i++] = +val||val; };
                console.log(arr);
                return arr;
            },

            reKMGT = /(:?[\d.,]+)\s*([kmgt])b/,    //eg 2 MB, 4GB, 1.2kb, 8Tb
            kmgtFactor = { k:1, m:1e3, g:1e6, t:1e9 },
            parseKMGT = function(val){
                return reKMGT.test( val.toLowerCase() ) ?
                    val.toFloat() * kmgtFactor[ RegExp.$2 ] :
                    'x';//isNaN
            };

        // guess the data type and convert to sortable values
        // collect converted values in data-type arrays (num,kmgt,dmy,nat)
        // if a value cannot be converted, set the data-type array to 'false'
        for( i=0; i<len; i++ ){

            val = (''+this[i]).trim();

            if( num && isNaN( num[i] = +val ) ) num=0;
            if( nat && !( nat[i] = val.match(reNAT) ) ) nat=0;
            //if(nat) console.log("**nat**",nat[i]);
            /* chrome accepts numbers as valid Dates -- so check for non-numeric chars */
            //if( dmy && ( num || isNaN( dmy[i] = Date.parse(val) ) ) ) dmy=0;
            if( dmy && ( num || isNaN( dmy[i] = Date.parse(val) ) ) ) dmy=0;
            if( kmgt && isNaN( kmgt[i] = parseKMGT(val) ) ) kmgt=0;

        };
        console.log("****", kmgt? "kmgt" : dmy ? "dmy" : num ? "num" : nat ? "nat": 'no conversion', "****");
        result = kmgt || dmy || num || nat || this;

        // make a sortable array:
        // [0] = sortable value or array
        // [1] = original value
        for( i=0; i<len; i++ ) result[i] = [ scalars( result[i] ), this[i] ];
        return result;

        //empty ? val.get('title') : val;  //checkme?
    },


    // Comparison function for sorting "natural sortable" arrays
    // - a[0] contains the sortable value;
    // - a[1] the original value
    // The sortable value is either a scalar or an array
    cmp: function(a,b){

        var aa, bb, i=0;

        // retrieve the sortable values: scalars or tokenized arrays
        a = a[0]; b = b[0];

        // scalars - integer, float date, string
        if( !a[0] ) return (a<b) ? -1 : (a>b) ? 1 : 0;

        // array of strings or numbers
        while( aa=a[i] ){
            if( !( bb=b[i++] ) ) return 1;
            //when comparing numbers and strings: fallback to string comparison
            if( isNaN(aa-bb) ){ aa+='';bb+=''; }
            if( aa !== bb ) return (aa > bb) ? 1 : -1;
        }
        return b[i] ? -1:0;
    }



});

