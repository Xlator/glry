(function(window, document, undefined) {

    // Base path
    window.basepath = $('header.mainheader').data('base');

    // Enable data transfer
    jQuery.event.props.push('dataTransfer');

    /* String formatting, like a real programming language :P */
    String.prototype.format = function() {
        var formatted = this;
        for(var i=0; i < arguments.length; i++) {
            var regexp = new RegExp('\\{'+i+'\\}', 'gi');
            formatted = formatted.replace(regexp, arguments[i]);
        }
        return formatted;
    }

    String.prototype.getFileName = function() {
        var input = this;
        return input.slice(input.lastIndexOf('/') + 1, input.length).replace(/["']/g,'');
    }

    // Notification setup
    humane.error = humane.spawn({addnCls: 'humane-jackedup-error'});

    /* Events */
    $(window).on('resize', window, Helper.resize); // Responsie resize

    // File upload dropzone events
    $(window).on('drop', 'div#imageDrop', function(e) { Upload.drop(e); });
    $(window).on('drop', 'div#collectionDrop', function(e) { Upload.drop(e); });


    $('body').on('click', 'a.login-window', Login.open)
             .on('click', 'a.close,#mask', Login.close)
             .on('click', 'div.image', Gallery.collection)
             .on('click', 'div.preview', Gallery.viewImage)
             .on('click', 'footer.previews span', Helper.scrollCollection)
             .on('submit', 'form.signin', function(e) {
                Login.submit(e);
             })

             .on('click', 'span.next', Gallery.nextImage)
             .on('click', 'span.prev', Gallery.prevImage)

             .on('keyup', function(e) {
                switch(e.which) {
                    case 37:
                        Gallery.prevImage();
                        break;
                    case 39:
                        Gallery.nextImage();
                        break;
                    default:
                        break;
                }
             })

             .on('click', "nav a", function(e) {
                e.preventDefault();
                var action = $(this).attr('href')
                 
        switch(action) {
            // case "#move":
            //     Gallery.previewPos();
            //     break;

            // case "#toggle":
            //     Gallery.previews();
            //     break;

            case "#":
                return false;

            case "#home":
                if(!Helper.isAdmin())
                    return false;
                window.location = "{0}{1}".format(basepath, Gallery.currentCollection);
                break;

            case "#uploaded": // Sort images by upload time
                Helper.sort('uploaded');
                break;

            case "#captured": // Sort images by capture time
                Helper.sort('captured');
                break;

            case "#admin": // Go to admin page
                if(Helper.isAdmin())
                    return false;
                window.location = "{0}admin/{1}".format(basepath, Gallery.currentCollection);
                break;

            case "#logout":
                Login.logout();
                break;

            case "#login": // Open login box
                Login.open();
                break;

            case "#delete": // Mark image for deletion
                Helper.toggleDelete($(this));
                break;

            case "#deletecollection":
                Helper.deleteDialog();
                break;

            default:
                $('section#images').children().remove().end().hide();
                Helper.pageTitle();
                break;
        }

    });
})(this,document);

$(document).ready(function() {

    // Helper.resize();

    $('div#collections').css('min-height', $(window).height() - 48)

    // Auto-open first collection on home page
    if(!Helper.isAdmin()) {
        var collection = Helper.collectionFromURL();
		console.log(collection);
        $('header.mainheader').find('li:first-child a').addClass('current');
        if(isNaN(collection))
            $('div.image').first().click();
        else {
            Gallery.collection(collection);
        }
    }


    else {
        Helper.resize();
        $('header.mainheader').find('li:nth-child(2) a').addClass('current');
        Gallery.currentCollection = Helper.collectionFromURL();
        Helper.pageTitle("Edit collection");

        // Send rename request on leaving an input field/pressing Enter
        $('body').on('blur', 'input', function(e) {
            Admin.rename($(this)); 
        }).on('keypress', 'input', function(e) {
            var code = e.keyCode || e.which;
            if(code == 13)
                Admin.rename($(this));
        });

        $(document).one('dragenter', Helper.Drag.enter); 

        $('div#collections').find('ul').sortable({
            revert: 100,
            containment: 'div#collections',
            start: function(event, ui) {
                $.each($('div#collections').find('li').not('li.ui-sortable-placeholder').not('li.ui-sortable-helper'), function(i, li) {
                    Helper.collectionOrder.push($(li).find('div').data('collection'));
                });
            },
            stop: function(event, ui) {
                Helper.updateCollectionOrder();
            }
        });

        $('ul#sortable').sortable({
            start: function(event, ui) {
                ui.item.siblings().css('opacity', 0.5);
                Helper.order = [];
                $.each($('ul#sortable').find('li').not('li.ui-sortable-helper').not('li.ui-sortable-placeholder'), function(i, li) {
                    Helper.order.push($(li).data('image'));
                });
            },

            stop: function(event, ui) {
                ui.item.siblings().css('opacity', 1);
                Helper.updateOrder(true);
            },
            revert: 100,
            handle: 'img.move', // Only move item when clicking move icon
            containment: 'section#content', // Don't allow dragging outside section#content

        });

        Helper.prev = function(src) {
            var div = $('<div/>').append($('<img/>').attr('src', src)); 
            div.dialog({ 
                autoOpen: true,
                modal: true,
            });
            div.appendTo($('body'));
        }
    }
});
