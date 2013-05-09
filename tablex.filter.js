/*
Class: TableX.Filter
	Allows to filter html tables based on regexp enabled filter search box.
	Filtering happens both on column and row basis.

Credits:
	Inspired by jquery.filterTable by Sunny Walker,
	http://sunnywalker.github.io/jQuery.FilterTable/

*/
TableX.Filter = new Class({

	Implements: Options,

	options :{
		minSize: 8,  //don't show the filter on tables with less than this number of rows
		shortcut: 'a.btn[href="#"][text="{0}"]', //shortcut template
		list: [],  //list of shortcuts to quickly filter the table
		hint: 'filter this table',  //HTML5 placeholder text for the filter field
		highlight: 'highlight'  //class applied to cells containing the filter term
	},

	initialize: function(table, options){

		options = this.setOptions(options).options;

		var self = this,
			items = [],
			minRows = options.minRows,
			filter = self.filter.bind(self);

		self.table = table = new TableX(table, {minSize:options.minSize});

		if( table ){

			options.list.each(function(item){
				items.push( options.shortcut.xsubs(item),{events:{click : self.shortcut.pass(item,self) }} );
			});

			['p.filter-input',[
				'input[type=search][placeholder="'+options.hint+'"]',{
					attach: [ self, 'input' ],
					events: {
						keyup: filter,	//'keyup:throttle': filter,
						click: filter
					}
				}],
				items
			].rendAr().inject(table.table,'before');

		}
	},

	shortcut: function(value){
		this.input.set('value', value).fireEvent('click').focus();
	},

	filter: function(){

		var self = this,
			visible = 'visible',
			highlight = self.options.highlight,

			rows = self.table.rows,
			cells = self.table.cells.removeClass(highlight),

			query = self.input.value,
			queryRE;


		try { queryRE = RegExp( query/*.escapeRegExp()*/, 'i'); } catch(e){}

		if( query == '' || !queryRE ){

			rows.show().addClass(visible);

		} else {

			rows.hide().removeClass(visible); //hide all

			cells.filter( function(el){

				return queryRE.test( $(el).get('text') );

			}).addClass(highlight).getParent(/*tr*/).show().addClass(visible);

		}
	}

});
