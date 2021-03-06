Gallery = {

    currentCollection: 0,
    selectedCollection: 0,
    pos: 0,
    // backgroundImageRegex: new RegExp("url\(([^\)]+?)\)"),




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
                // console.log(Gallery.currentCollection);
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

        // console.log($this);
        // console.log(li);
        // console.log(li.siblings());

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
                // console.log(images);

                if(images.length > 0) {
                    var key = images[0];
                    Gallery.currentCollection = collection;
                    Helper.pageTitle(response.title);
                    if(Helper.isAdmin() == false) {
                        Gallery.viewImage(key.collection_id, key.filename, key.title);

                        // Clear previews before loading
                        $('footer.previews').find('ul').text("");
                        
                        jQuery.each(images, Gallery.previews);
                        // $('section#images').text("").append(response).show();
                        // Helper.resize();
                        width = $('footer.previews ul').width((Gallery.imagecount * 110) + 32).width();
                        $('footer.previews ul').css('left', 0);

                     $('body').on('mouseenter', 'section#content', Helper.showImgExtras)
                              .on('mouseleave', 'section#content', Helper.hideImgExtras);
                        
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
        }).addClass('preview').attr('data-title', v.title).appendTo(li);

        // Highlight first preview
        if(k == 0) {
            li.addClass('selected');
        }

        $('footer.previews').find('ul').append(li);
        Gallery.imagecount = $('footer.previews').find('li').length;
    },

    viewImage: function() {
        console.log(arguments);
        var $this = $(this);
        // Click preview to load image
        Gallery.currentImage = new Image();
        if(arguments.length == 1) {
            var background = $this.css('background-image'),
                title = $this.data('title');

            Gallery.currentImage.src = background.slice(5, background.length - 2);
            $this.parent().siblings().removeClass('selected');
            $this.parent().addClass('selected');
        }

        // Autoload first image or click next/prev
        else {

            if(arguments.length == 4) { // Next/prev
                arguments[3].addClass('selected').siblings().removeClass('selected');
            }

            var background = Helper.background(arguments[0], arguments[1].getFileName()),
                title = arguments[2];
            
            
            Gallery.currentImage.src = background.slice(4, background.length - 1);
        }

        $('div.mainimg').css('background-image', background);
        if(title == null)
            $('footer.caption').text('').hide();
        else
            $('footer.caption').text(title).hide();
        Helper.resize();
    },

    nextImage: function() {
        // try {
            var next = $('footer.previews').find('li.selected').next('li').children('div'),
                background = next.css('background-image'),
                image = background.slice(background.indexOf('(') + 1, background.lastIndexOf(')'));

            console.log(image);

            Gallery.viewImage(Gallery.currentCollection, image, next.data('title'), next.parent());
            if(next.parent().next().length == 0)
                $('span.next').hide();
            $('span.prev').show();
        // }
        // catch(e) {}
    },

    prevImage: function() {
        try {
            var prev = $('footer.previews').find('li.selected').prev('li').children('div'),
                background = prev.css('background-image'),
                image = background.slice(background.indexOf('(') + 1, background.lastIndexOf(')'));
            Gallery.viewImage(Gallery.currentCollection, image, prev.data('title'), prev.parent());
            if(prev.parent().index() == 0)
                $('span.prev').hide();
            $('span.next').show();
        }
        catch(e) {}
    }

};
