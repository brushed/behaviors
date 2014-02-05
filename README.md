Dynamic Styles
==============

Alpha - work in progress / use at your own risk

Dynamic styles provide advanced styling possibilities for your html elements.
Dynamic Styles add dynamic behavior to standard dom elements.
The supporting javascript routines are typically initialized at page load.

	var behavior = new Behavior();

	behavior.add('ul.collapse', Collapsible.List,{some-options});
	... //other behaviors

	window.addEvent('domready', function(){ behavior.update(); });

----

- Accordion : create accordion effect, styling based on bootstrap Panel component
    Support different styles: vertical panels, tabs, pills, 
    left- and right-side pills.

- Collapsible : turn ordinary lists into collapsible trees and boxes.
	- Collapsible
	- Collapsible.List : make clickable list-items, to expand of collapse.
	- Collapsbile.Box : with header and body, which slides in/out vertically.

- Columns : create multi-column news-paper effect 

- CommentBox : create right floated commentbox, styling based on bootstrap

- Element.Reflect : generates a reflection at the bottom of an image.

- Graph-bars : horizontal or vertical graph bars inline or inside tables.
      Styling is now based on bootstrap progress-bars.

- TableX : enrich your tables with extended functionalities.
	- Tablex
	- Tablex.Sort : convert ordinary html tables into sortable tables.
	- Tablex.Filter : add advanced filtering and highlighting of table rows, and columns.
	- Tablex.Zebra : add alternate row colors to your tables.

- Tabs : create tabular sections in html pages.

- Viewer
	- Viewer : embed a video-player in a html page, by referring to the
		full url. With support for eg. youtube, vimeo, ..., external content.
	- Viewer.Carousel: embed a carousel viewer which (auto)cycles through
	    a set of images, video, external content.
		Unlike slimbox, the content is directly visible on the page.
	- Viewer.Slimbox : generates a modal overlay box with a rich media 
	    viewer to view one or more images, video, or external content.
    	(similar to lightbox)


- Other dynamic styles (not included)
	- Prettify : add code-coloring to a preformatted block of text. See Prettify Sourcecode
