// content.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if( request.action === 'getURL' ){
      var url = window.location.href;
      sendResponse( url );
    }else if( request.action === 'addReply' ){

      let textArea = '',
          domain = window.location.href,
          added  = false;

      if( domain.indexOf("app.codeable.io/tasks/") !== -1 ){

        textArea = document.getElementById('commentsForm').getElementsByTagName('textarea')[0];
        if( typeof(textArea) != 'undefined' && textArea != null && textArea != '' ){
          textArea.value = textArea.value !== '' ? textArea.value + '\n' + request.message : request.message;
          added = true;
        }

      }else if( domain.indexOf("mail.google.com/") !== -1 ){

        textArea = document.getElementsByClassName('gmail_default')[0];
        if( typeof(textArea) != 'undefined' && textArea != null && textArea != '' ){
          textArea.innerHTML = textArea.innerHTML !== '' ? textArea.innerHTML + '\n\n' + request.message : request.message;
          added = true;
        }

      }else if( domain.indexOf("outlook.live.com/") !== -1 ){

        textArea = document.querySelectorAll('[aria-label="Message body"]')[0];
        if( typeof(textArea) != 'undefined' && textArea != null && textArea != '' ){
          textArea.innerHTML = textArea.innerHTML !== '' ? textArea.innerHTML + '\n' + request.message : request.message;
          added = true;
        }

      }

      if( !added ){
        alert('You response couldn\'t be added.');
      }
    }
  }
);
