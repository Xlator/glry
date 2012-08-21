Login = {

        toggle: function() { // Change text and href of login/logout link
            var nav = $('header nav');

            // Logging in...
            if(nav.find('li:last-child').find('a').attr('href') == "#login") {
                $('a.log').attr('href', '#logout').text('Logout');
                // Insert Admin link
                $('<li/>').append(
                    $('<a/>').attr('href', '#admin').text('Admin')
                ).insertAfter(nav.find('li:first-child'));
                return;
            }

            // Logging out
            $('a.log').attr('href', '#login').text('Login');
            // Remove Admin link
            nav.find('li:nth-child(2)').remove();
        },

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

        submit: function(e) { // Submit login request
            e.preventDefault();
            $('div.spinner').css('opacity', 1);
            var form = $('form.signin'),
                username = form.find('input#form_username').val(),
                password = form.find('input#form_password').val();

            $.ajax({
                type: "POST",
                dataType: "json",
                url: "{0}api/login".format(basepath),

                data: {
                    'username': username,
                    'password': password
                },

                success: function(response) {
                    $('div.spinner').css('opacity', 0);
                    Login.toggle();
                    Login.close();
                    humane.log('You have been logged in. Welcome!');
                },

                error: function(response) {
                    $('div.spinner').css('opacity', 0);
                    humane.error = humane.spawn({ addnCls: 'humane-jackedup-error' });
                    humane.error('Login failed');
                }

            });
        },

        logout: function() {
            $.ajax({
                type: "GET",
                dataType: "json",
                url: "{0}api/logout".format(basepath),
                success: function(response) {
                    Login.toggle();
                    humane.log('You have been logged out');

                    // If we're on the admin page, return to the homepage
                    if(Helper.isAdmin())
                        window.location = basepath;
                }
            });
        }
    };
