Helper = { 

        delete: [],
        order: [], // Order of images in current collection
        collectionOrder: [], // Order of collections

        Drag: {
            // Event handler for dragging in files, shows dropzone overlay
            enter: function(e) {
                console.log(e.dataTransfer.types);
                console.log(typeof e.dataTransfer.types);

                var drag = true; 

                // Check file type(s) to avoid activating when dragging page elements around
                $.each(e.dataTransfer.types, function(i, v) {
                    if(typeof v == "string") {
                        if(v.indexOf('text') != -1)
                            drag = false;
                    }
                });

                if(drag == false)
                    // If the dragged object isn't a file, bind dragend event
                    return function() {
                        $(window).one('dragend', Helper.Drag.end);
                    }();

                Upload.createDropzones();
                $(window).one('dragleave', 'div#imageDrop', Helper.Drag.leave);
                $(window).one('dragleave', 'div#collectionDrop', Helper.Drag.leave);
            },
        
            // Event handler for leaving browser window while dragging
            leave: function(e) {

                // Unbind superfluous dragleave events to avoid duplication
                $(window).off('dragleave');

                Upload.destroyDropzones();

                // Rebind dragenter handler
                $(document).one('dragenter', Helper.Drag.enter); 
            },

            // Event hadner for ending the dragging of a page element/non-file
            end: function(e) {
                // Rebind dragenter
                $(window).one('dragenter', Helper.Drag.enter);
            },
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

        updateCollectionOrder: function() {
            var collections = $('div#collections').find('li');
            oldOrder = Helper.collectionOrder.join();
            Helper.collectionOrder = [];

            collections.each(function(i, li) {
                Helper.collectionOrder.push($(li).find('div.image').data('collection'));
            });

            newOrder = Helper.collectionOrder.join();

            if(oldOrder == newOrder)
                return false;

            $.ajax({
                type: "POST",
                dataType: "json",
                url: "{0}admin/reorder".format(basepath),
                data: { collections: Helper.collectionOrder },
                success: function(response) {
                    humane.log(response.message);
                },
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
