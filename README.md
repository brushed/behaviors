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

- Collapsible : turn ordinary lists into collapsible trees and boxes.
	- Collapsible
	- Collapsible.List : make clickable list-items, to expand of collapse.
	- Collapsbile.Box : with header and body, which slides in/out vertically.

- File-upload (todo)

- Graph-bars : horizontal or vertical graph bars inline or inside tables.

- Reflect : generates a reflection at the bottom of an image.

- TableX : enrich your tables with extended functionalities.
	- Tablex
	- Tablex.Sort : convert ordinary html tables into sortable tables.
	- Tablex.Filter : add advanced filtering and highlighting of table rows, and columns.
	- Tablex.Zebra : add alternate row colors to your tables.
	- Tablex.GroupBy : group table rows per column  (todo)
	- Tablex.Selector : select cells to calcualte sum, avg, min, max  (todo)

- Tabs  (todo) : create tabular sections in html pages.
	- TabbedAccordion: generates tabbed sections, with smooth transition effects based on accordion.
	- Accordion : generates vertical accordions.

- Viewer
	- Viewer : embed a video-player in a html page, by referring to the
		full url. With support for eg. youtube, vimeo, ..., external content.
	- Viewer.Carousel: embed a rich media viewer with support to cycle through a set of
		images, video, external content.
		Unlike slimbox, the content is directly visible on the page.
	- Viewer.Slimbox : generates a modal overlay box with a rich media viewer (eg. lightbox)
		to view one or more images, video, or external content.


- Other dynamic styles (not included)
	- Wiki.Category : generates pop up's with a list of pages referenced by the category page.
	- Tips : generates a transparent fly-over tip with additional info. Based on Mootools.More.Tip
	- Columns : (ref. Wiki.D-Styles) format text in multi-column news-paper format.
	- Prettify : add code-coloring to a preformatted block of text. See Prettify Sourcecode
