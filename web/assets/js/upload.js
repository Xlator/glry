    Upload = {
        allowed: ['image/jpeg','image/png','image/gif'],
        data: [],
        drop: function(e) { // Handle dropped files
            Helper.onDragleave();
            Upload.files = e.dataTransfer.files;

            Helper.dfd = $.Deferred();

            if($(e.currentTarget).attr('id') == 'collectionDrop') {
                Admin.createCollection(e);
            }
            else
                Helper.dfd.resolve();

            Helper.dfd.done(function(e) {
                $.each(Upload.files, function(index, file) {
                    var reader = new FileReader();
                    reader.onload = (function(file) {
                        return function(e) {
                            // Upload.data.push({
                            //     name: file.name,
                            //     value: this.result
                            // });
                        // console.log(file.type);
                        if($.inArray(file.type, Upload.allowed) == 0)
                            Upload.send({name: file.name, value: this.result});
                        else // Show error message when non-image files are dropped
                            humane.log("Images only!");
                        }
                    })(Upload.files[index]);

                    reader.readAsDataURL(file);
                });
            });

        },

        send: function(file) { // Send upload request
            $.ajax({
                type: 'POST',
                url: '{0}admin/upload/{1}'.format(basepath, Gallery.currentCollection),
                data: file,
                dataType: 'json',
                success: function(r) {
                    // console.log(r);
                    Admin.updateImages();
                    if(Helper.dfrd != undefined)
                        Helper.dfrd.resolve();
                }
            });
        },

        createDropzones: function() {
            if($('div#imageDrop').length > 0)
                return false;
            var contentWidth = parseInt($('section#content').css('width')),
                sidebarWidth = parseInt($('section#sidebar').css('width'));

            var imgdrop = $('<div/>').attr('id', 'imageDrop').css('width', contentWidth);
                coldrop = $('<div/>').attr('id', 'collectionDrop').css({
                    'width': sidebarWidth,
                    'left': contentWidth,
                });
            
            $('<span/>').text('Drop image(s) here to add to collection')
                .css('margin-top', ($(window).height() / 2) + 24).appendTo(imgdrop);

           $('<span/>').text('Drop image(s) here to create a new collection')
                .css('margin-top', $(window).height() / 2).appendTo(imgdrop).appendTo(coldrop);
                

            $('body').append(imgdrop).append(coldrop);
        },

        destroyDropzones: function() {
            $('div#imageDrop').remove();
            $('div#collectionDrop').remove();
        }
    };
