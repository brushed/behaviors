/*
Class: TableX
	Base class, with reusable table support functions.

	Add support for sorting, filtering and zebra-striping of tables.
	TODO: add support for row-grouping

	TODO: add support for check-box filtering (excel like) and customized filters
	Todo: replace "SELECT/OPTIONS" by Dom-based dropdown
	Todo: extended filtering in dropdowns, similar to excel-filters

Credit:
	Filters inspired by http://www.codeproject.com/jscript/filter.asp  and
	http://sunnywalker.github.io/jQuery.FilterTable/filtertable-sample.html

*/
var TableX = new Class({

	Implements: Events,

	initialize: function(table){

		var self = table.TableX;  //max one TableXtend instance per table DOM element

		if( !self ){
			//filter minima ( (minRows===0) || (self.rows.length > minRows) ) ){
			if( !table.match('table') ) return null;

			table.TableX = self = this;
			self.table = table;
			self.thead = $(table.rows[0]).getChildren('th');
			self.rows = Array.slice(self.table.rows, self.thead.length>0 ? 1 : 0);
			console.log(self.rows.length);
		}
		return self;
	},

	/*
	Function:refresh
		Put array of table rows back into the table
	*/
	refresh: function(rows){

		var	frag = document.createDocumentFragment();

		rows.each( function(r){ frag.appendChild(r); });
		this.table.appendChild(frag);

		this.fireEvent('refresh', this);
	},

	/*
	Function: getTableValues
		Fetch set of gBar values from a table
		* check first-row to match field-name: return array with col values
		* check first-column to match field-name: return array with row values
		* insert SPANs as place-holder of the missing gBars

	FIXME
	*/
	getTableValues: function(fieldName){

		var rows = this.rows,
			tlen = rows.length, h, l, r, result=[], i;

		if( tlen > 1 ){ /* check for COLUMN based table */
			r = rows[0];
			for( h=0, l=r.cells.length; h<l; h++ ){
				if( r.cells[h].getText().trim() == fieldName ){
					//select a COLUMN
					for( i=1; i< tlen; i++)
						//result.push( new Element('span').wraps(table.rows[i].cells[h]) );
						result.push( rows[i].cells[h] );
					return result;
				}
			}
		}

		for( h=0; h < tlen; h++ ){  /* check for ROW based table */
			r = rows[h];
			if( r.cells[0].getText().trim() == fieldName ){
				//select a ROW
				return  Array.slice(r,1);
			}
		}

		return false;
	}

});



//sort minima --if( table.rows.length < 3 ){ return null;}




/*
		if( !self.filters && options.filter){
			head.each( function(th,i){
				th.grab( new Element('select.filter',{
					events: {
						click: function(e){ e.stopPropagation(); },
						change: self.filter.bind(self,i)
					}
				}) );
			});
			self.filters = [];
			self.buildFilters();
		}

*/








var TableXtend = new Class({

	Implements: Options,

	options: {
		//sort: true,
		//filter: true,
		//zebra: [color1, color2],
		title : {
			all: "(All)",
			sort: "Click to sort",
			ascending: "Ascending sort. Click to reverse",
			descending: "Descending sort. Click to reverse"
		}
	},

	initialize: function( table, options ){

		//if( table.rows.length < 3 ){ return null;}
		if( !table.rows[3] ){ return null;}
		table = $(table);

		var self = table.TableXtend;  //max one TableXtend instance per table
		if( !self) {
			this.table = table;
			this.head = $$(table.rows[0].cells).filter('th');
			table.TableXtend = self = this;
		}
		options = self.setOptions(options).options;
		var head = self.head;

		if(!self.sorted && options.sort){
			head.each( function(th,i){
				th.set({
					'class': 'sort',
					title: options.title.sort,
					events: {
						click: self.sort.bind(self,i)
					}
				});
			});
			self.sorted = true;
		}


		if( !self.filters && options.filter){
			head.each( function(th,i){
				th.grab( new Element('select.filter',{
					events: {
						click: function(e){ e.stopPropagation(); },
						change: self.filter.bind(self,i)
					}
				}) );
			});
			self.filters = [];
			self.buildFilters();
		}


		if( !self.zebra && options.zebra ){
			(self.zebra = self.zebrafy.pass(options.zebra, self))();
		}

		return self;
	},

	/*
	Function: filter
		Filter the table based on the filter column and (selected) filter value.
		This function is also an onChange event handler linked with a 'select' element.

	Arguments
		column - index of the column to be used as sort key
		filtervalue - (optional) the value to be filtered, if not present,
			take the selected value of the dropdown filter
	*/
	filter: function( column, filtervalue ){

		var rows = this.getRows(),
			select = this.head[column].getLast(), //get select element
			value = filtervalue || select.get('value'),
			isAll = (value == this.options.title.all),
			filters = this.filters;

		// First check if the column is allready in the filters stack.
		// If so, store the new filter-value in the filters stack.
		// Otherwise, add a new entry at the end of the filters stack.
		if( filters.every( function( filter ,i ){

			if( filter.column != column ){ return true;}
			isAll ? filters.splice(i, 1) : filter.value = value;
			return false;

		}) ) filters.push( {value:value, column:column} );

		//reset visibility of all rows, and then apply the filters
		//rows.each( function(r){ r.show(); /*r.style.display='';*/ });
		rows.show();

		filters.each( function(filter){

			var value = filter.value,
				column = filter.column;

			this.buildFilter(column, value);

			rows.each( function(r){
				if( value != r.data[column] ){ r.hide();/*r.style.display = 'none';*/ }
			});

		},this);

		this.buildFilters(); //fill remaining dropdowns
	},


	/*
	Function:  buildFilters
		Build for each unfitered column a new filter dropdown.
	*/
	buildFilters: function( ){

		var self = this;

		self.head.each( function(th, column){

			//var filtered = this.filters.some( function(f){ return f.column==column });
			//if( !filtered ){ this.buildFilter( column ); }
			self.filters.some( function(f){ return f.column==column; }) || self.buildFilter( column );

		});
		Function.attempt( self.zebra );
	},

	/*
	Function: buildFilter
		Build a single column dropdown filter. Only the column values of the
		visible rows will be part of the filter dropdown.

	Arguments:
		table - table
		col - column index
		filterValue - normalised value of the selected item (optional)
	*/
	buildFilter: function( column, filterValue ){

		var select = this.head[column].getLast();
		if(!select){ return; } //empty dropdown ????

		var dropdown = select.options,
			rows = this.getRows(),
			all = this.options.title.all,
			rr = [],
			unique;

		this.guessDataType(rows, column);

		//collect only the visible rows
		rows.each( function(r){
			if( r.style.display !='none' ){ rr.push(r); }
		});

		this.doSort(rr, column);

		//build dropdown with all unique column values
		dropdown.length = 0;
		dropdown[0]= new Option(all, all);

		rr.each( function(r){
			var d = r.data[column];
			if( d && d != unique ){
				unique = d;
				//dropdown[dropdown.length] = new Option( $getText(r.cells[column]).clean()/*.trunc(32)*/, d);
				dropdown[dropdown.length] = new Option( r.cells[column].get('text').clean()/*.trunc(32)*/, d);
			}
		});
		select.value = filterValue || dropdown[0].value;

		// disable the dropdown if only one value
		//select.disabled = (dropdown.length <= 2);
		select.disabled = !dropdown[2];
	}


});
