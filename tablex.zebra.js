/*
	Function: zebrafy
		Add odd/even coloring to the table.

	Arguments:
		color1 - color specified in hex(without #) or as html color name.
		color1 - color specified in hex(without #) or as html color name.

		When the first color == 'table' or '' the predefined css class ''.odd''
		is used to color the alternative rows.
*/
TableX.Zebra = new Class({

	initialize: function(table,options){

		var colors = options.colors||['',''];

		this.colors = ( colors[0].test('table') ) ?
			'odd' :
			colors.map( function(color){ return new Color(color,'hex'); });

		return new Table(table, { onRefresh: this.zebrafy.bind(this) }) ? this : null;

	},

	zebrafy: function(table){

		var colors= this.colors, j = 0;

		//table.getVisibleRows().each( function(r){
		table.rows.each( function(r){

			if ( r.isVisible() /*.style.display!='none'*/ ){

				if ( colors[j] ){
					r.setStyle('background-color', colors[j]);
				} else {
					r.ifClass(j, colors);
				}

				j ^= 1; //0,1,0,1
				console.log(j);
			}
		});

	}

});

