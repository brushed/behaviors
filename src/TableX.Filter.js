/*
Class: TableX.Filter
    Allows to filter html tables based on regexp enabled filter search box.
    Filtering happens both on column and row basis.

Credits:
    Filters inspired by http://www.codeproject.com/jscript/filter.asp  and
    jquery.filterTable by Sunny Walker http://sunnywalker.github.io/jQuery.FilterTable/

Options:
    minSize - (number) minimum table rows to activate the filter
    shortcut - css selector for shortcut filter-strings
    list -(array) ist of shortcuts to quickly filter the table
    hint - HTML5 placeholder text for the filter field
    highlight - css class applied to cells matching the filter term

*/
TableX.Filter = new Class({

    Implements: Options,

    options: {
        minSize: 5,
        shortcut: "a.btn.btn-link[text=\"{0}\"]",
        list: [], //["99","test"],
        hint: "filter this table",
        highlight: "highlight"
    },

    initialize: function(table, options){

        options = this.setOptions(options).options;

        var self = this,
            items = [],
            minRows = options.minSize,
            filter = self.filter.bind(self);


        self.table = table = new TableX(table, {minSize:options.minSize});

        if( table && table.table){

            options.list.each(function(item){
                items.push( options.shortcut.xsubs(item), {
                    events: {click: self.shortcut.pass(item, self) }
                });
            });

            ["div.form-group.filter-input", [
                "span.icon-filter",
                "input.form-control[type=search][placeholder=\"" + options.hint + "\"]", {
                    attach: [ self, "input" ],
                    events: {
                        keyup: filter,    //"keyup:throttle": filter,
                        click: filter
                    }
                }],
                items
            ].slick().inject(table.table, "before");

        }
    },

    shortcut: function(value){
        this.input.set("value", value).fireEvent("click").focus();
        return false;
    },

    filter: function(){

        var self = this,
            visible = "visible",
            highlight = self.options.highlight,

            rows = self.table.rows,
            cells = self.table.cells.removeClass(highlight),

            query = self.input.value.trim(),
            queryRE;


        try {
            queryRE = RegExp( query, "i");  //support regexp in filter
            //queryRE = RegExp( query.escapeRegExp(), "i");
        }
        catch(e){}

        if( query == "" || !queryRE ){

            rows.show().addClass(visible);

        } else {

            rows.hide().removeClass(visible);

            cells.filter( function(el){

                return queryRE.test( $(el).get("text") );

            }).addClass(highlight).getParent(/*tr*/).show().addClass(visible);

        }

        self.table.refresh();
    }

});
