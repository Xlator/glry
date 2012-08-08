(function(window, document, undefined) {

    $.ajaxSetup({
            type: "GET",
            dataType: "html",
        });

    Helper = {
        // Check/set size of the filler div in the mainimg, takes number, returns size
        fillerSize: function(size) {
            if(typeof size == "number") {
                $('div.filler').css('height', size) 
            }
            return parseInt($('div.filler').css('height'));
        },

        // Toggle show/hide previews link text
        // showHideToggle: function() {
        // },

        
        pageTitle: function(title) { // Change/reset page title and contents of h1
            var mainTitle = "The Gallery";
            $("h1").text(mainTitle);
            if(title) 
                $('h1').append($("<span/>").text(" " + title).addClass("subtitle"));
             
            document.title = mainTitle + " : " + title;
        },

        resize: function() {
            var height = $(window).height(),
                width = $(window).width(),
                divwidth = width - 230;
            console.log("resize" + width);

            $('.mainimg').css({'width': divwidth, 'height': 2*((width - 230) / 3)});
            $('#images, header').css({'width': divwidth});
        }
    };

    Login = {
        open: function() { // Bring up the login box
            var loginBox = $('#login-box');
            $(loginBox).fadeIn(300);

            var popMargTop = ($(loginBox).height() + 24) / 2; 
            var popMargLeft = ($(loginBox).width() + 24) / 2; 

            $(loginBox).css({ 
                'margin-top' : -popMargTop,
                'margin-left' : -popMargLeft
            });

            Gallery.mask();
            return false;
        },

        // Close the login box
        close: function() {
            $('#mask , .login-popup').fadeOut(300 , function() {
                $('#mask').remove();  
            }); 
            return false;
        },
    };

    Gallery = {

        mask: function() { // Apply mask for modal windows
            $('body').append('<div id="mask"></div>');
            $('#mask').fadeIn(300);
        },

        collection: function() { // Open a collection
            $(window).triggerHandler('resize'); 
            var $this = $(this);

            $.ajax({
                url: "c/" + $this.data('collection'),
                success: function(response) {
                    $('section#images').text("").append(response).show();
                    Helper.resize();
                }
            });

            Helper.pageTitle($this.data('title'));
            Gallery.previews();
        },

        previews: function() { // Show or hide previews
            var previews = $('footer.previews'),
                toolbars = $('div.mainimg nav'),
                toolbar = (Helper.fillerSize() > 16 ? toolbars.first() : toolbars.last()),
                link = toolbars.children('a[href=#toggle]');

            if(!previews.is(":visible")) {
                previews.show();
                if(Helper.fillerSize() == 624) {
                    Helper.fillerSize(508);
                }
            }

            else {
                Gallery.hidePreviews();
            }

            if(link.first().text() == "Show previews") {
                link.text("Hide previews");
            }

            else {
                link.text("Show previews");
            }
        },

        hidePreviews: function() {
            $('footer.previews').hide();

            if(Helper.fillerSize() > 16) {
               Helper.fillerSize(624);
            }
        },
        
        previewPos: function() { // Toggle preview position

            var toolbars = $('div.mainimg').find('nav');
            if(Helper.fillerSize() > 16) {
                Helper.fillerSize(16);
                toolbars.toggle();
                return;
            }

            if($('footer.previews').is(":visible")) {
                Helper.fillerSize(508);
            }

            else {
                Helper.fillerSize(624);
            }

            toolbars.toggle();
            return;

        },

    };

    // Events
    $(window).on('resize', window, Helper.resize);
    $('body').on('click', 'a.login-window', Login.open);
    $('body').on('click', 'a.close,#mask', Login.close);
    $('body').on('click', 'div.image', Gallery.collection);
    $('body').on('click', "nav a", function(e) {
        e.preventDefault();
        var action = $(this).attr('href');

        switch(action) {
            case "#move":
                Gallery.previewPos();
                break;

            case "#toggle":
                Gallery.previews();
                break;

            case "#login":
                Login.open();
                break;

            default:
                $('section#images').children().remove().end().hide();
                Helper.pageTitle();
                break;
        }

    });
})(this,document);

$(document).ready(function() {
    Helper.resize(); 
});
