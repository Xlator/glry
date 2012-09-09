 Gallery = {

        currentCollection: 0,

        mask: function() { // Apply mask for modal windows
            $('body').append('<div id="mask"></div>');
            $('#mask').fadeIn(300);
        },

        collections: function() {
            $.ajax({
                type: "GET",
                dataType: "json",
                url: "{0}api/c".format(basepath),
                success: function(response) {
                    console.log(response);
                }
            });
        },

        collection: function(id) { // Open a collection
            // console.log(arguments); 
            if(typeof arguments[0] != Object)
                collection = arguments[0];
            else
                collection = $this.data('collection');

            // Don't reload the current collection
            if(collection == Gallery.currentCollection && Helper.override != true)
                return
            history.pushState({}, collection, collection);
            Gallery.currentCollection = collection;

            if(Helper.isAdmin()) {
                $('ul#sortable').empty();
                Admin.updateImages();
                return true;
            }

            $.ajax({
                type: "GET",
                dataType: "json",
                url: "{0}api/c/{1}".format(basepath, collection),
                success: function(response) {
                    images = response.images;

                    if(images.length > 0) {
                        var key = images[0];
                        Gallery.currentCollection = collection;
                        Helper.pageTitle(response.title);
                        if(Helper.isAdmin() == false) {
                            Gallery.viewImage(key.collection_id, key.filename);
                            
                            // Clear previews before loading
                            $('footer.previews').find('ul').text("");

                            jQuery.each(images, Gallery.previews);
                            // $('section#images').text("").append(response).show();
                            // Helper.resize();
                        }
                    }
                },

                error: function(response) {
                }
            });

            // Gallery.previews();
        },

        previews: function(k, v) { // Add preview of image
            li = $('<li/>');
            div = $('<div/>').css({
                "background-image": Helper.background(v.collection_id, v.filename)
            }).addClass('preview').appendTo(li);

            $('footer.previews').find('ul').append(li);  
        },

        viewImage: function() {
            // Click preview to load image
            if(arguments.length == 1) {
               var background = $(this).css('background-image');

                $(this).parent().siblings().removeClass('selected');
                $(this).parent().addClass('selected');
            }

            // Autoload first image
            else {
                var background = Helper.background(arguments[0], arguments[1]);
            }

            $('div.mainimg').css('background-image', background);
        }

    };
