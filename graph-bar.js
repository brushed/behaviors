 /*
Class: GraphBar
	Generate horizontal or vertical bars, without using images.
	Support any color, gradient bars, progress and gauge bars.
	The length of the bars can be based on numbers or dates.
	Allow to specify maximum and minimum values.

>	%%graphBars
>		%%gBar 25 /%
>	/%

	Graphbar parameters can be passed in js class constructor (options)
	or as css call-name parameters.

>	%%graphBars-min50-max3000-progress-lime-0f0f0f
>		%%gBar 25 /%
>	/%

	Other examples of wiki-markup:
> %%graphBars-e0e0e0 ... %%    use color #e0e0e0, default size 120
> %%graphBars-blue-red ... %%  blend colors from blue to red
> %%graphBars-red-40 ... %%    use color red, maxsize 40 chars
> %%graphBars-vertical ... %%  vertical bars
> %%graphBars-progress ... %%  progress bars in 2 colors
> %%graphBars-gauge ... %%     gauge bars in gradient colors

Options:
	classPrefix - CSS classname of parent element (default = graphBars)
	classBar - CSS classname of the bar value elements (default = gBar)
	lowerbound - lowerbound of bar values (default:20px)
	upperbound - upperbound of bar values (default:320px)
	vwidth - vertical bar width in px(default:20px)
	isHorizontal - horizontal or vertical bars (default:true)
	isProgress - progress bar show 2 bars, always summing up to 100%
	isGauge - gauge bars have colour gradient related to the size/value of the bar


DOM-structure:
	Original DOM-structure
>	<span class="gBar">100 </span>

	Is converted to following horizontal bar
>	<span class="graphBar" style="border-left-width: 20px;">x</span>
>	<span class="gBar">100 </span>

	or is converted to following vertical bar
>   <div style="height: 77px; position: relative;">
>       <span class="graphBar"
>             style="border-color: rgb(255, 0, 0);
>                    border-bottom-width: 20px;
>                    position: absolute;
>                    width: 20px;
>                    bottom: 0px;"/>
>       <span style="position: relative; top: 40px;"> 20 </span>
>    </div>

	or is converted to following progress bar
>	<span class="graphBar" style="border-color: rgb(0, 128, 0); border-left-width: 20px;">x</span>
>	<span class="graphBar" style="border-color: rgb(0, 255, 0); border-left-width: 300px; margin-left: -1ex;">x</span>
>	<span class="gBar">100 </span>


Examples:
>	new GraphBar( dom-element, { options });

*/

var GraphBar = new Class({

	Implements: Options,

	options: {
		classPrefix:"graphBars",
		classBar:"gBar",
		lowerbound:20,
		upperbound:320,
		vwidth:20, //vertical bar width
		isHorizontal:true,
		isProgress:false,
		isGauge:false
	},

	initialize: function(el, options){

		this.setOptions(options);
		this.parseParameters( el );

		var self = this,
			options = self.options,
			bars = el.getElements('.'+ options.classBar + options.barName), //collect all gBar elements
			color1 = self.color1,
			color2 = self.color2,
			border = (options.isHorizontal ? 'borderLeft' : 'borderBottom'),
			isProgress = options.isProgress,
			isGauge = options.isGauge,

			tmp = options.upperbound,
			ubound = Math.max(tmp, options.lowerbound),
			lbound = (tmp == ubound) ? options.lowerbound : tmp;

		if( !color2 && color1){
			color2 = (isGauge || isProgress) ? color1.invert() : color1;
		}

		//if( !bars.length /*length==0*/ ){ bars = self.getTableValues(el, options.barName); }
		if( !bars[0] ){ bars = self.getTableValues(el, options.barName); }

		if( bars ){

			var barData = self.parseBarData( bars, lbound, ubound-lbound );

			bars.each( function(el, index){

				var bar = {},
					progressbar = {},
					value = barData[index],
					barEL = new Element('span.graphBar'),
					pb = el.getParent(); // parent of gBar element

				bar[ border+'Width' ] = value;

				if( options.isHorizontal ){

					barEL.set('html','x');

					if( isProgress ){
						Object.append( progressbar, bar );
						bar[border+'Width'] = ubound - value;
						bar.marginLeft='-1ex';
					}

				} else { // isVertical

					if( pb.match('td') ){ pb = new Element('div').wrapContent(pb); }

					pb.setStyles({
						height: ubound + el.getStyle('lineHeight').toInt(),
						position: 'relative'
					});
					el.setStyle('position', 'relative'); //needed for inserted spans ;-)) hehe
					if( !isProgress ){ el.setStyle('top', ubound - value ); }

					Object.append( bar, {position:'absolute', width:options.vwidth, bottom:0} );

					if( isProgress ){ Object.append(progressbar,bar)[border+'Width'] = ubound; }

				}

				if( isProgress ){

					if( color1 ){ bar.borderColor = color1.hex; }

					if( color2 ){ progressbar.borderColor = color2.hex }
					else        { bar.borderColor = 'transparent' }

				} else if( color1 ){

					var percent = isGauge ? (value-lbound)/(ubound-lbound) : index/(bars.length-1);
					bar.borderColor = color1.mix(color2, 100 * percent).hex;

				}

				if( isProgress ){ barEL.clone().setStyles(progressbar).inject(el,'before'); }
				barEL.setStyles(bar).inject(el,'before');


			});
		}

	},

	parseParameters: function( el ){

		var self = this,
			options = self.options,
			parms = el.className.slice( options.classPrefix.length ).split('-');

		options.barName = parms.shift(), //first param is optional barName

		parms.each( function( p ){
			p = p.toLowerCase();
			if(p == "vertical"){ options.isHorizontal = false; }
			else if(p == "progress"){ options.isProgress = true;  }
			else if(p == "gauge"){ options.isGauge = true; }
			else if(!p.indexOf("min") /*index==0*/){ options.lowerbound = p.slice(3).toInt(); }
			else if(!p.indexOf("max") /*index==0*/){ options.upperbound = p.slice(3).toInt(); }

			else if(p != "") {
				p = new Color(p,'hex'); if(!p.hex){ return; }
				if( !self.color1 ){ self.color1 = p; }
				else if( !self.color2 ){ self.color2 = p; }
			}
		});

	},


	/*
	Function: parseBarData
		Parse bar data types and scale according to lbound and size
	*/
	parseBarData: function(nodes, lbound, size){
		var barData=[],
			maxValue=Number.MIN_VALUE,
			minValue=Number.MAX_VALUE,
			num=true,
			ddd=num;

		nodes.each(function( n ){
			var v = n.get('text');
			barData.push(v);
			num &= !isNaN(v.toFloat());
			/* chrome accepts numbers as valid Dates !! */
			ddd &= !isNaN(Date.parse(v)) && v.test(/[^\d]/);
		});

		barData = barData.map(function(b){
			if( ddd ){ b = new Date(Date.parse(b) ).valueOf(); }
			else if( num ){ b = b.match(/([+-]?\d+(?:\.\d+)?(?:e[-+]?\d+)?)/i)[1].toFloat(); }

			maxValue = Math.max(maxValue, b);
			minValue = Math.min(minValue, b);
			return b;
		});

		if(maxValue==minValue){ maxValue=minValue+1; }/* avoid div by 0 */
		size = size/(maxValue-minValue);

		return barData.map(function(b){
			return ( (size*(b-minValue)) + lbound).toInt();
		});

	},

	/*
	Function: getTableValues
		Fetch set of gBar values from a table
		* check first-row to match field-name: return array with col values
		* check first-column to match field-name: return array with row values
		* insert SPANs as place-holder of the missing gBars
	*/
	getTableValues: function(node, fieldName){

		var table = node.getElement('table');
		if(!table){ return false; }
		var tlen = table.rows.length, h, l, r, result, i;

		if( tlen > 1 ){ /* check for COLUMN based table */
			r = table.rows[0];
			for( h=0, l=r.cells.length; h<l; h++ ){
				if( $getText( r.cells[h] ).trim() == fieldName ){
					result = [];
					for( i=1; i< tlen; i++)
						//result.push( new Element('span').wrapContent(table.rows[i].cells[h]) );
						result.push( new Element('span').wraps(table.rows[i].cells[h]) );
					return result;
				}
			}
		}
		for( h=0; h < tlen; h++ ){  /* check for ROW based table */
			r = table.rows[h];
			if( $getText( r.cells[0] ).trim() == fieldName ){
				result = [];
				for( i=1,l=r.cells.length; i<l ; i++)
					//result.push( new Element('span').wrapContent(r.cells[i]) );
					result.push( new Element('span').wraps(r.cells[i]) );
				return result;
			}
		}
		return false;
	}
});