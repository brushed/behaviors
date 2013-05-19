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

	/* comparison function for normalised arrays */
	// a[0] contains the sortable value; a[1] the original value
	// the sortable value is either a scalar or an array

	cmp: function(a,b){

		var aa, bb, i=0;

		//retrieve the sortable value
		a = a[0]; b = b[0];

		//sortable value is a scalar - integer, float date, string
		if( !a[0] ) return (a<b) ? -1 : (a>b) ? 1 : 0;
		//if( !a[0] ){ a =[a]; b=[b]; }

		// sortable value is an array of scalars
		while( aa=a[i] ){
			if( !bb=b[i++] ) return 1;
			if( aa !== bb ) return (aa > bb) ? 1 : -1;
		}
		return b[i] ? -1:0;
	},

	naturalSort:function(){

		var arr = this.makeSortable();
		return arr.sort( this.cmp ).map( function(item){ return item[1]; })

	},

	makeSortable:function(){

		var num = true, dmy=num, kmgt=num, empty=num, nat=num,
			reKMGT = /([\d.,]+)\s*([kmgt])b/i,
			kmgtPower = { m:3, g:6, t:9 },
			reNAT = /(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g,
			val, i, len = this.length, result=[];

		/* guess data type */
		for( i=0; i<len; i++){

			val = this[i];

			num &= !isNaN(+val);
			nat &= reNAT.test(val);
			/* chrome accepts numbers as valid Dates -- so make sure non-digit chars are present */
			dmy &= !isNaN(Date.parse(val))  && !num; //val.test(/[^\d]/);
			kmgt &= reKMGT.test(val); //eg 2 MB, 4GB, 1.2kb, 8Tb
			empty &= (val=='');

		};
		console.log("num:"+num,"dmy:"+dmy,"kmgt:"+kmgt,"empty:"+empty,"nat:"+nat);

		/* map array to sortable values */
		for(i=0; i<len; i++){

			val = this[i];

			if( kmgt ){

				val = val.toLowerCase().match(reKMGT) || [0,'0',''];
				val = val[1].replace(/,/g,'').toFloat() * Math.pow(10, kmgtPower[ val[2] ] || 0);

				//val.toFloat()*Math.pow(10, v

			} else if( dmy ){

				val = Date.parse( val );

			} else if( nat ){

				val = val.match( reNAT );

			} else if( num ){

				val = +val;

			}

			//return empty ? val.get('title') : val;  //checkme?
			result[i]= [val, this[i]];

		};
    	return result;
	}

});

