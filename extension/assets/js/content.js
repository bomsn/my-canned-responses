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

        textArea = document.querySelectorAll('[contenteditable].editable');

        if( typeof(textArea) != 'undefined' && textArea != null && textArea != '' && textArea.length > 0 ){

          let cannedReply = document.createElement("div"),
              lastTextArea = textArea[textArea.length- 1],
              gmailQuote = lastTextArea.querySelectorAll('.gmail_quote');

          // Assign the reply to an element
          cannedReply.innerHTML = request.message;

          if( gmailQuote.length > 0 ){
            lastTextArea.insertBefore(cannedReply, gmailQuote[0])
          }else{
            lastTextArea.appendChild(cannedReply);
          }

          added = true;
        }

      }else if( domain.indexOf("outlook.live.com/") !== -1 ){

        textArea = document.querySelectorAll('[contenteditable]');
        if( typeof(textArea) != 'undefined' && textArea != null && textArea != '' && textArea.length > 0 ){
          let cannedReply = document. createElement("div"),
              lastTextArea = textArea[textArea.length- 1],
              outlookQuote = lastTextArea.querySelectorAll('#appendonsend');

          // Assign the reply to an element
          cannedReply.innerHTML = request.message;

          if( outlookQuote.length > 0 ){
            lastTextArea.insertBefore(cannedReply, outlookQuote[0])
          }else{
            lastTextArea.appendChild(cannedReply);
          }
          added = true;
        }

      }

      if( !added ){
        alert('You response couldn\'t be added.');
      }
    }
  }
);
