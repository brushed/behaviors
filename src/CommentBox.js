/*
Dynamic style: %%commentbox

Example:
>  %%commentbox ... /% : floating box to the right
>  %%commentbox-Caption .... /% : commentbox with caption

DOM structure
(start code)
    div.commentbox
    //becomes
    fieldset.commentbox
        legend LegendTitle

    //based on BOOTSTRAP Panels
    div.commentbox
        h2|h3|h4 title
        ..body..
    //becomes
    div.panel.panel-default
        div.panel-header
        div.panel-body
(end)
*/
function CommentBox(element, options){

    var caption = options.prefix.sliceArgs(element)[0],
        header = element.getFirst(),
        panelCSS = 'panel'.fetchContext(element);

    //todo-adopt bootstrap color pallet:  default,primary,success,info,warning,danger
        

    element.className='panel-body'; //reset className -- ie remove commentbox-...
    'div'.slick({'class':'commentbox '+panelCSS}).wraps(element);

    if( caption ){
        caption = ('h4[text='+caption.deCamelize()+']').slick();
    } else if( header && header.match('h2,h3,h4') ) {
        caption = header;
    }

    if( caption ){
        'div.panel-heading'.slick().grab(caption.addClass('panel-title')).inject(element, 'before');
    }

}  