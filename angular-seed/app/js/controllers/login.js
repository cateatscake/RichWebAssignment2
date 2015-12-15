'use strict';

angular.module('myApp.login', ['ngRoute', 'firebase'])

.config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        });
        $routeProvider.when('/post', {
            templateUrl: 'views/post1.html',
            controller: 'PostCtrl'
        });
		$routeProvider.when('/post-list', {
			templateUrl: 'views/post-list.html',
			controller: 'ListCtrl'
		});
}])

.controller('LoginCtrl', ['$scope', '$firebase', '$location', '$rootScope', function($scope, $firebase, $location, $rootScope) {
    console.log('in login controller');
    $scope.userEmail = "";
    $scope.userPassword = "";
	//$scope.userEmail = "mineauve@msn.com";
    //$scope.userPassword = "password";

    var authHandler =  function(error, authData) {
            if (error) {
                console.log("Login Failed!", error);
            } else {
                console.log("Authenticated successfully with payload:", authData);
                $rootScope.userData = authData;
                $rootScope.userData.email = $scope.userEmail;
                $location.path('/post-list');
                $scope.$apply();
				
            }
        };

    $scope.loginUser = function() {
        console.log('loginUser');

        var ref = new Firebase("https://cateatscake.firebaseio.com");

        // Create a callback to handle the result of the authentication
        /*function authHandler(error, authData) {
            if (error) {
                console.log("Login Failed!", error);
            } else {
                console.log("Authenticated successfully with payload:", authData);
                $rootScope.userData = authData;
                $rootScope.userData.email = $scope.userEmail;
                $location.path('/post-list');
                $scope.$apply();
            }
        }*/

        // Or with an email/password combination
        ref.authWithPassword({
            email    : $scope.userEmail,
            password : $scope.userPassword
        }, authHandler);
    }
	
	
	$scope.signUpUser = function() {
		console.log('signUpUser');

		
		var ref = new Firebase("https://cateatscake.firebaseio.com");


        ref.createUser({
            email    : $scope.userEmail,
            password : $scope.userPassword
        }, function(error, userData) {
            if (error) {
                console.log("Error creating user:", error);
            } else {
                console.log("Successfully created user account with uid:", userData.uid);

                ref.authWithPassword({
                    email    : $scope.userEmail,
                    password : $scope.userPassword
                }, authHandler);
				
				//$location.path('/post');
                //$scope.$apply();
				
            }
        });
	}

}])

.controller('PostCtrl', ['$scope', '$firebase', '$rootScope', function($scope, $firebase, $rootScope) {
    console.log('in post controller');
        console.log($rootScope.userData);
        $scope.userEmail = $rootScope.userData.email;

        var messagesRef = new Firebase('https://cateatscake.firebaseio.com/');

        $("#submit-btn").bind("click", function() {
            var messageField = $("#messageInput");
            //var messageField_val = $.trim(messageField.val());
            var message = messageField.val();

            messagesRef.push({text:message, name:$rootScope.userData.email});
            messageField.val('');

        });

        messagesRef.on('child_added', function(snapshot) {
            //var uniqName = snapshot.name();
            //var comment = snapshot.val().messageField;
            var commentsContainer = $('#prev-comments');
            var data = snapshot.val();
            var message = data.text;
            var name = data.name;


            $('<div/>', {class: 'comment-container'})
                .html('<span class="user-label">' + (name? name: 'Anon')
                +': </span>' + message).prependTo(commentsContainer);

            //commentsContainer.scrollTop(commentsContainer.prop('scrollHeight'));
        });

}])

.controller('ListCtrl', ['$scope', '$firebase', '$rootScope', function($scope, $firebase, $rootScope) {
    console.log('in post list controller');
	$('.create-new-post-area').hide();
	console.log($rootScope.userData);
    $scope.userEmail = $rootScope.userData.email;
	
	$scope.newPost = function() {
        console.log('add new post clicked');
		//Add post box now visible
		$('.create-new-post-area').show();
		$('.posts').hide();

        var postListRef = new Firebase('https://cateatscake.firebaseio.com/all_posts');

        $("#createPost").bind("click", function() {
			console.log('creating new post...');
            var titleField = $("#titleInput");
			var postField = $("#postInput");
			var title = titleField.val();
            var post = postField.val();
			//console.log('post created...');

            postListRef.push({title:title, author:$rootScope.userData.email, content:post});
			
            titleField.val('');
			postField.val('');
			
			console.log('post created...');
			//get key from push
			var postloc= postListRef.key();
			console.log('post id: ', postloc);
			
			$('.create-new-post-area').hide();
			$('.posts').show();

        });
		
		$("#cancelPost").bind("click", function() {
			$('.create-new-post-area').hide();
			$('.posts').show();
		});
	}
		var postListRef = new Firebase('https://cateatscake.firebaseio.com/all_posts');
        postListRef.on('child_added', function(snapshot) {
            var postContainer = $('#post');
            var data = snapshot.val();
			var title = data.title;
            var post = data.content;
            var author = data.author;


            $('<div/>', {class: 'post-container'})
                .html("<span class='post-title' ng-click='postLoc()'>" + (title)
                +"</span>" + "<span class ='author'><br>by: " + (author? author: 'Anon') 
				+ " </span>").prependTo(postContainer);

        });
		
		$scope.postLoc = function() {
			console.log('post title clicked');
			//$('.create-new-post-area').show();
		}
		
	
	
}])