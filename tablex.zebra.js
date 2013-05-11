/*
Class: TableX.Zebra
	Simple class to add odd/even coloring to tables.

	When the first color == 'table' or '' the predefined css class ''.odd''
	is used to color the alternative rows.

Usage:
	> new TableX.Zebra( table-element, {colors:['eee','fff']});
	> new TableX.Zebra( table-element, {colors:['red']});

*/
TableX.Zebra = function(table, options){

	var colors = options.colors,

		stripe = function( table ){

			table && table.rows.filter( Element.isVisible ).each( function(row,j){
				j &= 1;
				if( colors[0] && colors[j] ){
					row.setStyle('background-color', colors[j]);
				} else {
					row.ifClass(j, colors);
				}
			});
		};

	colors = ( !colors[0] || colors[0]=='table' ) ?
		'odd' :
		colors.map( function(c){ return new Color(c); });

	console.log(options.colors, colors[0],colors[1]);

	stripe( new TableX(table, { onRefresh:stripe }) );

}
