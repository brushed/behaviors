Behaviors
==============

The Behavior classes provide enhanced styling capabilities for your DOM elements.
They add dynamic behavior to standard dom elements.
The supporting javascript routines are typically initialized at page load.

	var behavior = new Behavior();

	behavior.add('ul.collapse', Collapsible.List,{some-options} );
	... //other behaviors

	window.addEvent('domready', function(){ behavior.update(); });

----

- Accordion : create accordion effect, styling based on bootstrap Panel component
    Support different styles: vertical panels, tabs, pills, 
    left- and right-side pills.

- Collapsible : turn ordinary lists into collapsible trees and boxes.
	- Collapsible
	- Collapsbile.Box : with header and body, which slides in/out vertically.
	- Collapsible.List : make clickable list-items, to expand of collapse.

- Columns : create multi-column news-paper effect 

- CommentBox : create right floated commentbox, styling based on bootstrap

- Element.Reflect : generates a reflection at the bottom of an image.

- GraphBar : create horizontal or vertical graph bars inline or inside tables.
      Styling is based on bootstrap progress-bars. (only css, no images)

- TableX : enrich your tables with extended functionalities.
	- Tablex : abstract parent class
	- Tablex.Sort : convert ordinary html tables into sortable DOM tables.
	- Tablex.Filter : add advanced filtering and highlighting of DOM tables.
	- Tablex.Zebra : add alternate row colors to your DOM tables.

- Tabs : create tabular sections in html pages.

- Viewer
	- Viewer : embed a media-player in a html page, based on the full url of common
		media sites: with support for eg. youtube, vimeo, ..., and external content.
	- Viewer.Slimbox : generates a modal overlay box with a Viewer media-player 
	    to view one or more images, video, or external content. (similar to lightbox)
	- Viewer.Carousel: embed a carousel viewer which (auto)cycles through
	    a set of images, video, external content.

