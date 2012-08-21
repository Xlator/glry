 Admin = {

        rename: function(input) { // Rename image or collection
            var value = input.val(),
                lastTitle = input.next().val();

            // Stop if the title is unchanged
            if(value == lastTitle)
                return true;

            if(input.attr('id') == "collection_title")
                var url = "{0}admin/rename".format(basepath);

            else {
                var imageid = input.closest('li.adminpreview').data('image'),
                    url = "{0}admin/rename/{1}".format(basepath, imageid);
            }

            $.ajax({
                type: "POST",
                dataType: "json",
                url: url,
                data: {
                    collection: Gallery.currentCollection,
                    title: value,
                },
                success: function(response) {
                    input.next().val(value);
                    humane.log(response.message);
                    if(input.attr('id') == "collection_title")
                        $('div.image[data-collection={0}]'.format(Gallery.currentCollection))
                            .find('footer').children('span').text(value);
                },
                error: function(response) {
                    humane.log(response.Exception);
                    input.val(lastTitle);
                }
            });
            
        },

        createCollection: function(e) {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "{0}admin/create".format(basepath),
                success: function(response) {
                    humane.log("Collection {0} created".format(response.id));
                    Helper.dfrd = $.Deferred();

                    Gallery.currentCollection = parseInt(response.id);
                    Helper.dfd.resolve(e);
                    Helper.dfrd.done(function() {
                        Helper.dffd = $.Deferred();
                        Helper.override = true;
                        Gallery.collection(Gallery.currentCollection);
                        Helper.dffd.done(function(images) {
                            console.log(response);
                            var key = images[0];
                            var clone = $('ul#collections_model').find('li').clone(true),
                                url = "{0}collections/{1}/{2}".format(basepath, key.collection_id, key.filename);
                            clone.find('div').css('background-image', 'url({0})'.format(url))
                                .data({collection: response.id, title: response.title })
                                .attr({'data-collection': response.id, 'data-title': response.title})
                                .find('span.imgcount').text(images.length).end()
                                .find('footer').find('span').text(response.title).end()
                                .find('time').text(date("Y-m-d", response.created));
                            console.log(clone);
                            clone.appendTo($('div#collections').find('ul'));
                            
                        });
                    });
                    // Upload.drop(e);
                }
            });
        },

        deleteCollection: function() {
            $.ajax({
                type: "POST",
                dataType: "json",
                url: "{0}admin/delete/{1}".format(basepath, Gallery.currentCollection),
                data: {},
                success: function(response) {
                    humane.log(response.message);
                    $('div#collections').find('div.image[data-collection={0}]'.format(Gallery.currentCollection)).parent().remove();
                    $('div.image').first().click();
                }
            });
        },

        deleteImages: function() {
            // Stop if there are no images marked for deletion
            if(Helper.delete.length == 0)
                return false;

            $.ajax({
                type: "POST",
                dataType: "json",
                url: "{0}admin/delete".format(basepath),
                data: { delete: Helper.delete },
                success: function() {
                    
                    // Remove deleted images from DOM
                    $.each(Helper.delete, function(index, image) {
                        $('li.adminpreview[data-image={0}]'.format(image)).remove();
                    });

                    Helper.updateOrder(true);
                    console.log(Helper.order);
                    humane.log('Images deleted'); 
                },
            });
        },
        // updateOrder: function() {
        //     console.log(Helper.order);
        //     $.ajax({
        //         type: "POST",
        //         dataType: "json",
        //         url: "{0}admin/reorder/{1}".format(basepath, Gallery.currentCollection),
        //         data: Helper.order
        //     });
        // },

        // updateCollections: function() {
        //     $.ajax({
        //         type: "GET",
        //         dataType: "json",
        //         url: "{0}api/c".format(basepath),
        //         success: function(response) {
        //             var collections = $.makeArray(response);
        //             if($('div.image').length > 0)
        //                 collections.splice(0, $('div.image').length);
                    
        //             $.each(collections, function(index, collection) {
        //                 console.log(collection);
        //             });
        //         },
        //     });
        // },

        updateImages: function() { // Load newly uploaded images into the DOM
            $.ajax({
                type: "GET",
                dataType: "json",
                url: "{0}api/c/{1}".format(basepath, Gallery.currentCollection),
                success: function(response) {
                    if(Helper.override === true)
                        Helper.dffd.resolve(response.images);

                    // console.log(response);
                    $('input#collection_title').first().val(response.title);
                    var previews = $('ul#sortable').find('li.adminpreview').length;

                    // Filter out old images from response
                    if(previews > 0)
                        response.images.splice(0, previews);

                    $.each(response.images, function(index, image) {
                        // console.log(image);
                        var filename = "{0}collections/{1}/{2}".format(basepath, Gallery.currentCollection, image.filename),
                            // PHP style data function courtesy of phpjs.org (see date.js)
                            captime = date('Y-m-d H:i', image.captured),
                            uptime = date('Y-m-d H:i', image.uploaded),
                        
                            // Get clone of dummy preview item
                            preview = $('ul#adminpreview_model').find('li.adminpreview').clone(true);
                        preview.data({
                            image: parseInt(image.id, 10), 
                            pos: image.pos
                        })
                            .find('img').first().attr({
                                src: "{0}collections/{1}/{2}".format(basepath, Gallery.currentCollection, image.filename),
                                alt: image.title
                            });

                        preview.attr('data-image', parseInt(image.id, 10));
                        preview.find('input').val(image.title);
                        preview.find('time.captured').data('timestamp', image.captured).text(captime);
                        preview.find('time.uploaded').data('timestamp', image.uploaded).text(uptime);
                        preview.hide().appendTo($('ul#sortable')).show();
                    });    
                }
            });
        }
    };
