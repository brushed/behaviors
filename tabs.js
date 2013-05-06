/*
Class: TabbedSection
	Creates tabs, based on some css-class information
	Use in jspwiki:
	(start code)
	%%tabbedSection
	%%tab-FirstTab
		...
	/%
	%%tab-FirstTab
		...
	/%
	/%
	(end)

	Alternative syntax, when no .tab-xxx classes are embedded,
	the section headers will be defined based on the first header element
	(start code)
	%%tabs
	!First tab title
		...
	!Second tab title
		...
	/%
	(end)


Example:
	(start code)
	div.tabbedSection
		div.tab-FirstTab
		div.tab-SecondTab
	(end)
is changed into
	(start code)
	div.tabmenu
		span
			a.activetab
			a
	div.tabbedSection.tabs
		div.tab-firstTab
		div.tab-SecondTab.hidetab
	(end)
*/

var Tab = new Class({

	options:{
		nav: 'tabmenu',
		active: 'activetab',
		hide: 'hidetab',
		pane: 'tab-',
		panes: 'tabs'
	},

	initialize:function(element,options){

		self.setOptions(options);

		this.getNav(element).getElements('a:not([href])').addEvent('click',this.show);

	},

	getNav:function( element ){

		var options = this.options,
			name,
			nav = element.getElement( options.nav );

		if( !nav ){

			//build a new nav section
			element
				.addClass( options.panes )  //check!!!

				.grab( nav = new Element('div.'+options.nav), 'before' )

				.getChildren('[class^='+options.pane+']').each( function(pane){

					name = pane.className.slice(4).deCamelize(); 		//remove tab-prefix,  fixme slice(n)
					if( !pane.id || (pane.id=="") ){ pane.id = name; }	//allow hashed tabs -ffs

					pane.grab( new Element('div.clearbox') ); //checkme: is this still needed, replaced by .clearfix in css?

					nav.grab( new Element('a', {text:name})	);

				})

			this.show.call( nav.getFirst() );  //make first tab visible

		}
		return nav;
	},

	show:function(){

		var options = this.options,
			hide = options.hide,
			active = options.active,

			nav = this.getParent(),
			navs = nav.getChildren(),
			index = navs.indexOf(this),
			panes = nav.getNext().getChildren();

		navs.removeClass(active)[index].addClass(active);
		panes.addClass(hide)[index].removeClass(hide);

	}

});