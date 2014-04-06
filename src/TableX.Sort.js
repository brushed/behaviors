/*
Class: TableX.Sort
    Adds ''click'' handlers to sort table columns.
    CSS classes are added to the header depending on the sort order.
    The data-type of each column is auto-recognized.

    Todo: add progress animation while sorting

Depends:
    Array.naturalSort

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

    initialize: function(table, options){

        this.setOptions(options);
        
        this.table = table = new TableX(table,{ minSize: 3 });

        if( table && table.thead ){
            //table.table.rows[0].addEvent( 'click:relay(th)', this.sort.bind(this) );
            table.thead.addEvent( 'click', this.sort.bind(this) );
            this.style( table.thead, 'sort' );
        }

    },

    style: function(element, newStyle){
        var options = this.options;
        element.set({'class': options.css[newStyle], title: options.hints[newStyle] });
    },

    sort: function( event ){

        var table = this.table,
            thead = table.thead,
            rows = table.rows,
            css = this.options.css,
            th = event.target,
            sortAtoZ = th.hasClass(css.atoz) ? 'ztoa':'atoz';

        //this.style(th, "processing");
        table.refresh(
            th.hasClass( css.sort ) ?
                rows.naturalSort( thead.indexOf(th) ) :
                rows.reverse()
        );
        this.style( thead, 'sort');
        this.style( th, sortAtoZ );

    }

});