/*
Class: TableX.GroupBy
    Under Construction

*/
TableX.GroupBy = new Class({

    Implements: Options,

    options :{
        column: "x",
        hint: 'filter this table'
    },

    initialize: function(table, options){

        options = this.setOptions(options).options;

        var self = this,
            minRows = options.minRows,
            groupBy = self.groupBy.bind(self);

        self.table = table = new TableX(table, {});

        if( table ){
            //todo
        }
    },

    groupBy: function(){
        //todo
    }

});
