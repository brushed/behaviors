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
			this.reset();
		}

	},

	//reset class and hints on all TH's
	reset: function(){

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

		this.reset();

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

		var sortable, cell,
			cache = 'cache'; //name of the cache attribute on each row


		if( !rows[0][cache] || !rows[0][cache][column] ){

			//convert the column to an array of sortable values
			sortable = rows.map( function(row){
				cell = row.cells[column];
				return cell.getAttribute('jspwiki:sortvalue') || cell.get('text');
			}).makeSortable();

			//now cache the sortable data in row.cache[column]
			rows.each( function(row, index){
				if( !row[cache] ){ row[cache]=[]; }
				//row.cache[column] = empty ? row.cells[column].get('title') : sortable[index];
				row[cache][column] = sortable[index];
			});

		}

		return function(a,b){
			a = a[cache][column];
			b = b[cache][column];
			var ai, bi, i=0, n, len = a.length;
			while( i < len ){
				ai = a[i];
				bi = b[i++];
				if( !bi ) return 1;
				if( ai !== bi ){
					n = ai-bi;
					return isNaN(n) ? ai>bi ? 1 : -1 : n ;
				}
			}
			return b[i] ? -1 : 0;
		}

	}
});


Array.implement({

	makeSortable:function(){

		var num = true, flt=num, ddd=num, ip4=num, euro=num, kmgt=num, empty=num, nat=num,
			reKMGT = /([\d.,]+)\s*([kmgt])b/,
			kmgtPower = { m:3, g:6, t:9 },
			reNAT = /(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g,
			result = [];


		this.each( function( v ){

			if( v ){

				v = v.clean().toLowerCase();

				num &= v.test(/\d+/);

				flt &= !isNaN(v.toFloat());
				/* chrome accepts numbers as valid Dates -- so make sure non-digit chars are present */
				ddd &= !isNaN(Date.parse(v))  && v.test(/[^\d]/);
				ip4 &= v.test(/(?:\d{1,3}\.){3}\d{1,3}/); //169.169.0.1
				//euro &= v.test(/^[£$€][\d.,]+/);
				euro &= v.test(/^[\xa3$\u20ac][\d.,]+/);
				kmgt &= v.test(reKMGT); //eg 2 MB, 4GB, 1.2kb, 8Tb
				empty &= (v=='');

				nat &= reNAT.test(v);
console.log("*"+v+"*",nat, reNAT.test(v), v.match(reNAT));
			}

		});

ip4=false;
num=false;
flt=false;
		console.log( kmgt ? "kmgt" : euro ? "euro" : ip4 ? "ip4" : ddd ? "date" : flt ? "float" : num ? "num": "string", nat ? "nat" : "string" );

		return this.map( function( val ){

			if( kmgt ){

				val = val.toLowerCase().match(reKMGT) || [0,'0',''];
				val = val[1].replace(/,/g,'').toFloat() * Math.pow(10, kmgtPower[ val[2] ] || 0);

			} else if( euro ){

				val = val.replace(/[^\d.,]/g,'').toFloat();
/*
			} else if( ip4 ){

				val = val.split( '.' );
				val = ( (val[0].toInt() * 256 + val[1].toInt() ) * 256 + val[2].toInt() ) * 256 + val[3].toInt();
*/
			} else if( ddd ){

				val = Date.parse( val );

			} else if( flt ){

				//val = val.match(/([+-]?\d+(:?\.\d+)?(:?e[-+]?\d+)?)/)[0].toFloat();
				val = val.toFloat(); //parseFloat(val)

			} else if( num ){

				val = val.match(/\d+/)[0].toInt();

			}

			else if( nat ){
				val = val.match(reNAT);
				console.log("natSort ",val);
			}

			//return empty ? val.get('title') : val;  //checkme?
			return val[0] ? val : [val];

		});

	}

});

