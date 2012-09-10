Gallery = {

    currentCollection: 0,
    selectedCollection: 0,
    pos: 0,

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

    filterCollections: function() {
        return $(this).data("collection") == Gallery.selectedCollection;
    },

    collection: function(collection) { // Open a collection
        switch(typeof arguments[0]) {
            case "number":
                console.log(Gallery.currentCollection);
                Gallery.selectedCollection = arguments[0];
                collection = Gallery.selectedCollection;
                $this = $('div.image').filter(':visible').filter(Gallery.filterCollections);
                break;

            case "object":
                $this = $(this);
                Gallery.selectedCollection = $this.data('collection');
                collection = Gallery.selectedCollection;
        }

        var li = $this.parent();

        console.log($this);
        console.log(li);
        console.log(li.siblings());

        li.siblings().children().removeClass('selected');
        $this.addClass('selected');

        // Don't reload the current collection
        if(Gallery.selectedCollection == Gallery.currentCollection && Helper.override != true)
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
                        width = $('footer.previews ul').width((Gallery.imagecount * 110) + 32).width();
                        $('footer.previews ul').css('left', 0);
                        
                        // $('footer.previews ul').css({
                        //     position: 'absolute',
                        //     left: 0
                        // });

                        if($('footer.previews span').length == 0) {
                            Helper.createArrows();
                        }

                        Helper.collpos = 0;
                        if(width < $(window).width())
                            Helper.hideArrows();
                        else
                            Helper.showArrows('right');
                            Helper.hideArrows('left');
                    }
                }
            },

            error: function(response) {
                $('div.image').first().click();
            }
        });

        // Gallery.previews();
    },

    previews: function(k, v) { // Add preview of image
        li = $('<li/>');
        div = $('<div/>').css({
            "background-image": Helper.background(v.collection_id, v.filename)
        }).addClass('preview').appendTo(li);

        // Highlight first preview
        if(k == 0) {
            li.addClass('selected');
        }

        $('footer.previews').find('ul').append(li);
        Gallery.imagecount = $('footer.previews').find('li').length;
    },

    viewImage: function() {
        // Click preview to load image
        Gallery.currentImage = new Image();
        if(arguments.length == 1) {
            var background = $(this).css('background-image');
            Gallery.currentImage.src = background.slice(5, background.length - 2);
            $(this).parent().siblings().removeClass('selected');
            $(this).parent().addClass('selected');
        }

        // Autoload first image
        else {
            var background = Helper.background(arguments[0], arguments[1]);
            Gallery.currentImage.src = background.slice(4, background.length - 1);
        }

        $('div.mainimg').css('background-image', background);
        Helper.resize();
    }

};
