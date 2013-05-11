/*
Class: TableX
	Base class, with reusable table support functions.
	Used by TableX.Sort, TableX.Zebra, ...


Credit:
	Filters inspired by http://www.codeproject.com/jscript/filter.asp  and
	http://sunnywalker.github.io/jQuery.FilterTable/filtertable-sample.html

Usage:
	> var t = new TableX(table-element);
	Creates maximum one TableX instance per table DOM element.

	> t.addEvent('onRefresh', console.log('table got refreshed.'));
	> t.refresh(new-rows-array);

*/
var TableX = new Class({

	Implements: [Options,Events],

	initialize: function(table, options){

		var self = table.TableX,  //max one TableXtend instance per table DOM element
			minSize = ( options||{} ).minSize||0;

		if( !self ){

			if( !table.match('table') ||
				( (minSize!=0)&&(table.rows.length < minSize) ) ) return null;

			table.TableX = self = this;
			self.table = table;
			self.thead = $(table.rows[0]).getChildren('th');
			self.rows = $$(Array.slice(table.rows, self.thead.length>0 ? 1 : 0));
			self.cells = table.getElements('td'); //fixme: check for nested tables

		}
		return self && self.setOptions(options);  //set additional options
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
