Dynamic Styles
==============

Dynamic styles provide advanced styling possibilities for your html elements.
Dynamic Styles add dynamic behavior to standard dom elements.
The supporting javascript routines are typically initialized at page load.

	var behavior = new Behavior();

	behavior.add('ul.collapse', Collapsible.List,{some-options});
	... //other behaviors

	window.addEvent('domready', function(){ behavior.update(); });

----

- Collapsible
	Turn ordinary lists into collapsible trees. See Collapsible List
	- Collapsible
	- Collapsible.List
		A collapsible list has clickable list-items, to expand of collapse.
	- Collapsbile.Box
		A collapsible box has a header and a body, which slides in/out vertically.

- File-upload (todo)

- Graph-bars
	Add horizontal or vertical graph bars to your html pages and tables.

- Reflect
	Generates a reflection at the bottom of an image.

- TableX
	Enrich your tables with extended functionalities.
	- Tablex
	- Tablex.Sort
		Convert ordinary html tables into sortable tables.
	- Tablex.Filter
		Support advanced filtering and highlighting of table rows, and columns.
	- Tablex.Zebra
		Add alternate row colors to your tables.
	- Tablex.GroupBy

- Tabs  (todo)
	Create tabular sections in html pages.
	- TabbedAccordion
		Generates a tabbed section, with smooth transition effects based on accordion.
	- Accordion
		Generates vertical accordions.

- Viewer
	- Viewer
		Allows to embed a video-player in a html page, by referring to the
		full url.  (supports eg. youtube, vimeo, ..., external content )
	- Viewer.Carousel
		Embed a rich media viewer with support to cycle through a set of
		images, video, external content.
		Unlike slimbox, the content is directly visible on the page.
	- Viewer.Slimbox
		Generates a modal overlay box with a rich media viewer (eg. lightbox)
		to view one or more images, video, or external content.


- Other dynamic styles (not included)
	- Wiki.Category
		Generates pop up's with a list of pages referenced by the category page.
	- Tips
		Generates a transparent fly-over tip with additional info. Based on Mootools.More.Tip
	- Columns  (ref. Wiki.D-Styles)
		Format text in multi-column news-paper format.
	- Prettify
		Add code-coloring to a preformatted block of text. See Prettify Sourcecode
