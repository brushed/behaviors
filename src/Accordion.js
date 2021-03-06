/*
Class: Accordion
    Add accordion effects
    - type=accordion : vertical collapsible panes, with toggle buttons on top of each pane
    - type=tabs : vertical collapsible, with tab-like nav buttons on top
    - type=pills : vertical collapsible panes, with pill-like nav buttons left or right
            from the panes

    The styling is based on the panel component of the bootstrap framework.

DOM structure:
(start code)
    //before invocation
    div.accordion
        div.tab-FirstTab ..
        div.tab-SecondTab ..

    //accordion
    div.panel-group.accordion : panel headings are toggles
        div.panel.panel-default
            div.panel-heading.actie
            div  => fx.accordion collapsible content
                div.panel-body
        div.panel.panel-default
            div.panel-heading  => toggle
            div  => fx.accordion collapsible content
                div.panel-body

    //tabbedAccordion : tab toggles, panels without border
    ul.nav.nav-tabs
        li
            a
    div.panel-group.tabbedAccordion
        div.active  => fx.accordion collapsible content
            div.panel-body
        div  => fx.accordion collapsible content
            div.panel-body

    //leftAccordion : pill-toggles, panels with border
    ul.nav.nav-pills.pull-left
        li
            a
    div.panel-group.leftAccordion
        div  => fx.accordion collapsible content
            div.panel.panel-default.panel-body
        div  => fx.accordion collapsible content
            div.panel.panel-default.panel-body

    //rightAccordion : pill-toggles, panels with border
    ul.nav.nav-pills.pull-right
        li
            a
    div.panel-group.leftAccordion
        div  => fx.accordion collapsible content
            div.panel.panel-default.panel-body
        div  => fx.accordion collapsible content
            div.panel.panel-default.panel-body

(end)
*/
var Accordion = new Class({

    Implements: Options,
    Extends: Tab,

    options: {
        //type: "accordion"   //accordion,tabs,pills
        //position: "pull-left" or "pull-right"  (only relevant with "pills")
    },

    initialize: function(container, options){

        var panes = this.getPanes( container ),
            nav, pane, name, toggle, type, position,
            i = 0,
            active = "active",
            toggles = [],
            contents = [],
            panelCSS = "panel".fetchContext(container);

        this.setOptions(options);
        type = this.options.type;
        position = this.options.position;

        if( position ){ position = ".nav-stacked." + position; }

        nav = (type == "tabs") ? "ul.nav.nav-tabs" :
               (type == "pills") ? "ul.nav.nav-pills" + (position || "") :
                 false;

        if( nav ){ nav = nav.slick().inject(container, "before"); }
        container.addClass("panel-group");

        //modify the DOM
        while( pane = panes[i++] ){

            name = this.getName(pane);

            if( nav ){ //tabs or pills style accordion

                nav.grab( toggle = ["li", [ "a", {text: name} ]].slick() );
                if( type == "pills" ) { pane.addClass( panelCSS ); }

            } else {  //standard accordion

                toggle = "div.panel-heading".slick({ text: name });
                "div".slick({"class": panelCSS}).wraps( pane ).grab( toggle, "top" );

            }

            toggles.push( toggle );
            contents.push( "div".slick().wraps( pane.addClass("panel-body") ) );

        }

        //invoke the Accordion animation
        new Fx.Accordion( toggles, contents, {

            //height: true,
            alwaysHide: !nav,   //allow closing all panes
            onComplete: function(){
                var el = $(this.elements[this.current]);
                if(el.offsetHeight > 0){ el.setStyle("height", "auto"); }
            },
            onActive: function(toggle, content){
                toggle.addClass(active);
                content.addClass(active);
            },
            onBackground: function(toggle, content){
                toggle.removeClass(active);
                content.removeClass(active);
            }

        });

    }

});
