/*
Class: TableX.Sort
    Adds ''click'' handlers to sort table columns.
    CSS classes are added to the header depending on the sort order.
    The data-type of each column is auto-recognized.

    Todo: add spinner while sorting

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
