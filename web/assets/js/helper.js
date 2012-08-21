Helper = { 

        delete: [],
        order: [],

        // Event handler for dragging in files, shows dropzone overlay
        onDragenter: function(e) {

            if($.inArray('Files', e.dataTransfer.types) == -1) {
                $(window).one('dragenter', Helper.onDragenter);
                return;
            }

            Upload.createDropzones();
            // var dle = $(window).data('events').dragleave;
            // console.log(dle);
            $(window).one('dragleave', 'div#imageDrop', Helper.onDragleave);
            $(window).one('dragleave', 'div#collectionDrop', Helper.onDragleave);
        },
        
        // Event handler for leaving browser window while dragging
        onDragleave: function(e) {
            // console.log(e);
            $(window).off('dragleave');
            Upload.destroyDropzones();
            $(document).one('dragenter', Helper.onDragenter); 
        },

        isAdmin: function() {
            return window.location.href.indexOf("admin") != -1;
        },

        pageTitle: function(title) { // Change/reset page title and contents of h1
            var mainTitle = "The Gallery";
            $("h1").text(mainTitle);

            if(title) {
                $('h1').append($("<span/>").text(" " + title).addClass("subtitle"));
                document.title = mainTitle + " : " + title;
            }

            else
                document.title = mainTitle;
        },

        // Responsive resizing of elements according to window size
        resize: function() {
            var height = $(window).height(),
                width = $(window).width(),
                divwidth = width - 230;

            $('.mainimg').css({
                'width': divwidth, 
                'height': 2*((width - 230) / 3), 
                'background-size': 'contain'
            });

            $('#content, body > header').css({'width': divwidth});
        },

        background: function(collection, filename) {
            if(arguments.length == 0) {
                return "url({0}assets/images/load.gif)".format(basepath);
            }

            return "url({0}collections/{1}/{2})".format(basepath, collection, filename);
        },

        collectionFromURL: function() { // Return id of current collection from URL
            var lastslash = window.location.href.lastIndexOf('/');
            return parseInt(window.location.href.slice(lastslash+1), 10);
        },

        toggleDelete: function(link) { // Mark images for deletion

            var imageid = link.closest('li.adminpreview').data('image'),
                selected = link.data('selected'),
                img = link.find('img');

            switch(selected) {
                case 1:
                    var index = $.inArray(imageid, Helper.delete);
                    Helper.delete.splice(index, 1);
                    img.attr('src', "{0}assets/images/list_remove.png".format(basepath));
                    link.data('selected', 0);
                    break;

                default:
                    Helper.delete.push(imageid);
                    img.attr('src', "{0}assets/images/list_remove_red.png".format(basepath));
                    link.data('selected', 1);
                    break;
            }
        },

        deleteDialog: function() {
            var delImg = function(event, ui) {
                Admin.deleteImages();
            };
            $('<div/>').addClass('deleteDialog').dialog({
                autoOpen: true,
                title: 'Confirm delete',
                modal: true,
                buttons: {
                    DeleteImages: function(event, ui) {
                        Admin.deleteImages();
                        $(this).dialog('close');
                    },
                    DeleteCollection: function(event, ui) {
                        Admin.deleteCollection();
                        $(this).dialog('close');
                    },
                    Cancel: function(event, ui) {
                        $(this).dialog('close');
                    }
                },
                resize: false,
                close: function(event, ui) {
                    $(this).dialog('destroy').remove();
                } 
            }).appendTo($('body'));

            $('span.ui-button-text').first().text('Delete selected images').end()
                .eq(1).text('Delete collection').end()
                .eq(2).text('Cancel');

            // if(Helper.delete.length == 0)
            //     $('button.ui-button').first(0).remove();
        },

        updateOrder: function(silent) {
            var previews = $('ul#sortable').find('li.adminpreview');

            // Store old order in a string for later comparison
            oldOrder = Helper.order.join();

            Helper.order = [];

            previews.each(function(i, li) {
                Helper.order.push($(li).data('image'));
            });

            newOrder = Helper.order.join();

            // Stop if order is unchanged
            if(oldOrder == newOrder)
                return false;

            // Store src of first image to set as key later
            var firstImage = previews.first().find('img:first').attr('src');

            $.ajax({
                type: "POST",
                dataType: "json",
                url: "{0}admin/reorder/{1}".format(basepath, Gallery.currentCollection),
                data: { collection: Helper.order },
                success: function(response) {
                    if(!silent) // Only show a message if silent is falsey
                        humane.log(response.message);

                    // Change collection key image
                    $('div.image[data-collection={0}]'.format(Gallery.currentCollection)).css({
                        'background-image': "url({0})".format(firstImage)
                    });

                }
            });
        },

        sort: function(criteria) { // Quick sort images by upload/capture time
            images = [];
            $('ul#sortable').find('li.adminpreview').each(function(index, image) {
                images.push({
                    id: $(image).data('image'),
                    timestamp: $(image).find('time.'+criteria).data('timestamp'),
                    elem: $(image),
                });
            });

            images.sort(function(a, b){
                var a1 = a.timestamp,
                    b1 = b.timestamp;
                if(a1 == b1)
                    return 0;
                return a1 > b1 ? 1 : -1;
            });

            $('ul#sortable').empty();

            $.each(images, function(index, image) {
                image.elem.appendTo($('ul#sortable'));
            });
            Helper.updateOrder();
        }
    };
