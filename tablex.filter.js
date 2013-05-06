TableX.Filter = new Class({

	Implements: Options,

	options :{
		highlight: 'alt',   //class applied to cells containing the filter term
		minRows: 8,  //don't show the filter on tables with less than this number of rows
		list: [],  //list of phrases to quick fill the search
		hint: 'filter this table'  //HTML5 placeholder text for the filter field
	},

	initialize: function(table, options){

		options = this.setOptions(options).options;

		var self = this,
			items = [],
			minRows = options.minRows,
			filter = self.filter.bind(self);

		//self.table = table;
		self.rows = table.getElements('tr');  //fixme : what about nested tables
		self.cells = table.getElements('td');

		if( table.match('table') && ( (minRows===0) || (self.rows.length > minRows) ) ){

			options.list.each(function(item){
				items.push( 'a.quick[href="#"][text="'+item+'"]',{events:{click : self.quick.pass(item,self) }} );
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
			].rendAr().inject(table,'before');

		}
	},

	quick: function(value){
		this.input.set('value', value).fireEvent('click').focus();
	},

	filter: function(){

		var self = this,
			visible = 'visible',
			highlight = self.options.highlight,

			rows = self.rows,
			cells = self.cells.removeClass(highlight),

			query = self.input.value,
			queryRE;


		try { queryRE = RegExp( query/*.escapeRegExp()*/, 'i'); } catch(e){}

		if( query == '' || !queryRE ){

			rows.show().addClass(visible);

		} else {

			rows.hide().removeClass(visible);

			cells.filter( function(el){

				return queryRE.test( $(el).get('text') );

			}).addClass(highlight).getParent(/*tr*/).show().addClass(visible);

		}
	}

});

