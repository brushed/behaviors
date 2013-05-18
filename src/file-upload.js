/*
Class: FileUpload
	Plugin to modify a basic HTML form to upload multiple files.

	The script works by hiding the file input element when a file is selected,
	then immediately replacing it with a new, empty one.
	Although ideally the extra elements would be hidden using the CSS setting
	'display:none', this causes Safari to ignore the element completely when
	the form is submitted. So instead, elements are moved to a position
	off-screen.
	On submit, any remaining empty file input element is removed.

	Todo: drag&drop file uploads ?


Credit:
	Inspired by MultiUpload by Stickman, http://the-stickman.com
	Rewritten for JSPWiki.

Arguments:
	input - DOM input element
	options - optional, see options below

Options:
	max - maximum number of files to upload, 0 means no limit.
	pattern - pattern string to add file-number to the name and id attributes
		of the input element. The default pattern is '{0}'
		Eg: <input name=file{0}>  will be changed to file0, file1, file2.
	delBtn -
	id - (optional) Base ID attribute for all input fields, eg. file{Ø}
		Default takes the ID of the main input element
	name - (optional) Base name attribute for all input fields, eg. file{Ø}
		Default takes the name of the main input element

DOM Structure:
	(start code)
	<ul class="fileupload'>
		<li>
			<input type="file" disabled="" name="file0" id=""/>
		</li>
		<li>
			<a class="delete"/>
			<span>file-name-1</span>
			<input type="file" name="file1" id="" style="position:absolute;left:-1000px;"/>
		</li>
		<li>
			<a class="delete"/>
			<span>file-name-2</span>
			<input type="file" name="file2" id="" style="position:absolute;left:-1000px;"/>
		</li>
	</ul>
	(end)

Example:
>		new FileUpload( $('uploadform'), {
>			max:3,
>			delBtn:new Element('a',{ 'class':'delete tool' })
>		});

*/
var FileUpload = new Class({

	Binds:['add','remove'],
	Implements: [Options],

	options:{
		max: 0,
		pattern: '{0}',
		delBtn: 'a'
		//delBtn:new Element('a')
	},

	initialize: function(input, options){

		var self = this;

		self.input = input;
		if( input && input.match('input[type=file]') ){

			options = self.setOptions(options).options;

			self.ul = new Element('ul.fileupload').inject(input,'after');

			if( input.id ){ options.id = input.id;}
			if( input.name ){ options.name = input.name;}
			options.delBtn = new Element(options.delBtn);
			self.addLI( input );

			input.form.addEvent('submit', function(){
				//ul.getFirst().getFirst().disabled=true;
				//ul.getFirst().destroy();
			});
		}
	},

	addLI: function( input ){

		var self = this;

		input.addEvent('change', self.add );
		new Element('li').grab( input ).inject( self.ul,'top' );
		self.setID();

	},

	setID: function(){

		var options = this.options,
			pattern = options.pattern;

		this.ul.getElements('input').each( function(item, index){

			item.name = options.name.replace( pattern, index );
			item.id = options.id.replace( pattern, index );

		});
	},

	add: function( ){

		var self = this,
			input = self.input,
			options = self.options,
			max = options.max,
			count = self.ul.getChildren().length;

		if( !max /*max==0*/ || count <= max ){

			input
				.setStyles({ position:'absolute', left:'-999px'}) //hide - move to .css
				.getParent().adopt(

					options.delBtn.clone().addEvent('click', self.remove),

					new Element('span', {
						text: input.value.replace(/.*[\\\/]/, '')
					})
				);

			self.addLI( new Element('input[type=file]',{ disabled: count == max }) );
		}
	},

	remove: function(){

		this.input.getParent().destroy(); //remove list item
		this.setID();
		this.ul.getFirst().getFirst().disabled = false;

	}

});
