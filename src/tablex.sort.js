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
            this.cleanTH();
        }

    },

    cleanTH: function(){

        var options = this.options;
        this.table.thead.set({'class': options.css.sort, title: options.hints.sort });

    },

    /*
    Function: sort
        Click event-handler, to perform a sort based on the clicked column header.

    */
    sort: function( event ){

        var options = this.options,
            table = this.table,
            rows = table.rows,
            th = event.target,
            css = options.css,
            sortAtoZ = th.hasClass(css.atoz);

        //sort or reverse the table
        table.refresh(
            th.hasClass( css.sort ) ?
                rows.naturalSort( table.thead.indexOf(th) ) :
                rows.reverse()
        );
        //reformat the header
        this.cleanTH();
        sortAtoZ = sortAtoZ ? 'ztoa':'atoz';
        th.swapClass(css.sort, css[sortAtoZ]).set('title', options.hints[sortAtoZ]);

    }

});



!function(){

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
    function makeSortable(arr,column){

        var num=[], dmy=[], kmgt=[], nat=[], val, i, len = arr.length, dom,

            //split string in sequences of digits, separated by ., and alpha-strings
            reNAT = /(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g,

            KMGTre = /(:?[\d.,]+)\s*([kmgt])b/,    //eg 2 MB, 4GB, 1.2kb, 8Tb
            KMGTmul = { k:1, m:1e3, g:1e6, t:1e9 },
            KMGTparse = function( val ){
                return KMGTre.test( val.toLowerCase() ) ?
                    val.toFloat() * KMGTmul[ RegExp.$2 ] : NaN;
            };

        // guess the data type and convert to sortable values
        // collect converted values in type specific arrays (num,kmgt,dmy,nat)
        // if a value cannot be converted, set the type specific array to 'false'
        for( i=0; i<len; i++ ){

            //FIXME:: empty ? val.get('title') : val;
            val = arr[i];
            dom = val && val.getChildren; // typeOf(val)=='element'
            if( !isNaN(column) ) val = (dom ? val.getChildren() : val)[column];
            val = (dom ? val.get('text') || val.get('title') :''+val).trim();
            //console.log(val);

            if( num && isNaN( num[i] = +val ) ) num=0;
            //if( num && (val.charAt(0)=='0') ) num[i] = val; //keep string value when left padded with '0'

            if( nat && !( nat[i] = val.match(reNAT) ) ) nat=0;

            //Note: chrome accepts numbers as valid Dates -- so accept only strings with non-numeric chars
            //Known limitation: Date.parse also accepts "<any string>MM" or "<any string>YYYY"
            if( dmy && ( num || isNaN( dmy[i] = Date.parse(val) ) ) ) dmy=0;

            if( kmgt && isNaN( kmgt[i] = KMGTparse(val) ) ) kmgt=0;

        };

        console.log("[",kmgt?"kmgt":dmy?"dmy":num?"num":nat?"nat":'no conversion',"] ", kmgt||dmy||num||nat||arr);

        return kmgt || dmy || num || nat || arr;

    }

    /*
    Function: cmp
        Comparison function for sorting "natural sortable" arrays.
        The entries of sortable arrays consists of tupples:
        ( .[1] is the sortable value, .[0] is the original value )

        The sortable value is either a scalar or an array.
    */
    function naturalCmp(a,b){

        var aa, bb, i=0, t;

        // retrieve the sortable values: scalars or tokenized arrays
        a = a[1]; b = b[1];

        // scalars, always same types - integer, float, date, string
        if( typeof a !='object' ) return (a<b) ? -1 : (a>b) ? 1 : 0;
        //if( !a.length ) return a.localeCompare(b);

        while( aa = a[i] ){

            if( !( bb = b[i++] ) ) return 1; //fixme

            t = aa - bb;       //auto-conversion to numbers, if possible
            if( t ) return t;  //otherwise fall-through to string comparison
            //if( t && aa.charAt(0)!='0' && bb.charAt(0)!='0' ) return t;  //padded string '001' < '01'

            if( aa !== bb ) return (aa > bb) ? 1 : -1;
            //if( aa !== bb ) return aa.localeCompare(bb);

        }
        return b[i] ? -1 : 0;
    }

    /*
    Function: naturalSort
        Sorts the elements of an array, using a more 'natural' algoritm.
        Maintains a cache of the prepared sortable array.

    Example:
        [0, 1, "017", 6, , 21 ].naturalSort();  //[0, 1, 6, "017", 21]

        rows.naturalSort( 3 );

    */
    Array.implement('naturalSort',function(column, force){

        var self = this,
            cache = 'cache',
            sortable = self[cache] || [],
            hasColumn = (typeof column == 'number'),
            result = [], i, len = self.length;

if(sortable.length) console.log("CACHED>> ", sortable );

        if( hasColumn ){

            sortable = sortable[column] || [];

            if( !sortable.length/*==0*/ || force ){
                console.log("build a new cache ", self, column);
                if( !self[cache] ) self[cache] = sortable;  //cache===[]
                self[cache][column] = sortable = makeSortable(self, column);
            }

        } else {

            if( !sortable.length/*==0*/ || column ){  //column===force flag in this case
                //console.log("build a new cache ", self, column);
                self[cache] = sortable = makeSortable(self);
            }

        }
if(sortable.length) console.log("SORTABLE>> ", sortable );


        //wrap [sortable-value] into [item, sortable-value]
        for( i=0; i<len; i++) result[i] = [ self[i], sortable[i] ];

        result.sort( naturalCmp );

        //unwrap sorted items
        for( i=0; i<len; i++) self[i] = result[i][0];

        return self;

    });

}();