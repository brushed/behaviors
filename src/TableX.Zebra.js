/*
Class: TableX.Zebra
    Simple class to add odd/even coloring to tables.
    Default colouring via css class "".odd""

    CHECKME: use BOOTSTRAP class .striped

Usage:
    > new TableX.Zebra( table-element, {colors:["eee","fff"]});
    > new TableX.Zebra( table-element, {colors:["red"]});

*/
TableX.Zebra = function(table, options){

    function stripe(){

        this.rows.filter( Element.isVisible ).each( function(row, j){

            j &= 1; //0,1,0,1...

            if( hasColors ){

                row.setStyle("background-color", colors[j] || "");

            } else {

                row.ifClass(j, "odd");

            }

        });
    }

    var colors = options.colors,
        hasColors = colors[0] && (colors[0] != "table");

    if ( hasColors ){ colors = colors.map( function(c){ return new Color(c); }); }

    //console.log("ZEBRA ",options.colors, colors[0],colors[1]);
    stripe.call( new TableX(table, { onRefresh: stripe }) );

};
