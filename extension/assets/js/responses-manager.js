// response-manager.js
(function ($) {

  // Get the data
  var data = [],
      domain = '';
  // Assgin domain and perform related tasks
  getDomain();
  // Assign Data and perform related tasks
  getData();

  // Change to editor view
  $(".add-new-message").on('click', function(event){
      event.stopPropagation();
      event.stopImmediatePropagation();
      openTemplateEditor();
  });
  // Change to responses view
  $("#discardNewTemplate").on('click', function(event){
      event.stopPropagation();
      event.stopImmediatePropagation();
      closeTemplateEditor();
  });
  // Add the selected response to the comment box
  $('.container').on('click', '.insert-response', function(event){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if( $(this).hasClass('disabled') ){
        return;
      }
      // Small animation
      $(this).fadeOut();
      $(this).fadeIn();
      // Get the message
      let key = $(this).closest('.single-item').attr('data-key'),
          type    = $(this).attr('data-type'),
          message = '';
      if( data.length > 0 ){
        jQuery.each(data, function(index, obj) {
          if( obj.key == key ){
            message = obj.message;
            return false;
          }
        });
      }

      if( type == 'copy' ){
        copyToClipboard( message );
      }else{

        // Supply the message to the page
        browser.tabs.query({currentWindow: true, active : true}).then( function(tabs){
          let activeTab = tabs[0];
          let action = type == 'add' ? 'addReply' : type ;
          browser.tabs.sendMessage(activeTab.id, {"action": action, "message": message}).then( function(response){
              if( ! response ){
                alert('You response couldn\'t be added.');
              }
          });
        });

      }

  });

  // Edit an existing item
  $('.container').on('click', '#editTemplate', function(event){
      event.stopPropagation();
      event.stopImmediatePropagation();
      var key = $(this).closest('.single-item').attr('data-key');
      if( key !== undefined && key !== '' ){
        openTemplateEditor( key );
      }
  });
  $('.container').on('click', '#deleteTemplate', function(event){
      event.stopPropagation();
      event.stopImmediatePropagation();
      var key = $(this).closest('.single-item').attr('data-key');
      if( key !== undefined && key !== '' ){
        deleteMessage( key );
      }
  });
  // Add a new response
  $('.container').on('click', '#saveNewTemplate', function(event){
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      var title    = $('#templateTitle').val(),
          message = $('#templateResponse').val(),
          key      = $('form').attr('data-id');

    $('#templateTitle').removeClass('is-invalid');
    $('#templateResponse').removeClass('is-invalid');

    if( title !== '' && message !== '' ){
      addMessage( title, message, key );
    }else{
      if( title == ''){
        $('#templateTitle').addClass('is-invalid');
      }
      if( message == ''){
        $('#templateResponse').addClass('is-invalid');
      }
    }

  });

  function openTemplateEditor( key = false ){

    if( key !== false ){
      jQuery.each(data, function(index, obj) {
        if( obj.key == key ){

          $('form').attr( 'data-id', key );
          $('#templateTitle').val( obj.title );
          $('#templateResponse').val( obj.message );

        }
      });
    }

    $('#existingTemplates').addClass('hidden');
    $('#newTemplate').removeClass('hidden');

    $('#addNewBtn').addClass('hidden');
    $('#discardNewTemplate').removeClass('hidden');

  }
  function closeTemplateEditor(){
    $('#existingTemplates').removeClass('hidden');
    $('#newTemplate').addClass('hidden');

    $('#addNewBtn').removeClass('hidden');
    $('#discardNewTemplate').addClass('hidden');

    $('#templateTitle').val('');
    $('#templateResponse').val('');
    $('#templateTitle').removeClass('is-invalid');
    $('#templateResponse').removeClass('is-invalid');
  }

  function addMessage( title, message, key = 0 ){

    itemObj = {
      title: title,
      message: message,
      key: key,
    };

    if( key.length > 1  ){
      // If updating an existing item
      if( data.length > 0 ){
        jQuery.each(data, function(index, obj) {
          if( obj.key == key ){
            data[index] = itemObj;
            return false;
          }
        });
      }

    }else{
      // If adding a new item
      itemObj.key = generate_item_key(title);
      data.push(itemObj);

    }

    // Reset the form data
    $('form').attr('data-id', 0);
    $('form').find(':input').val('');

    // Refresh items
    refreshItems();
    // Close editor
    closeTemplateEditor();
    // Save data
    setData();
  }
  function deleteMessage( key ){

    if( data.length > 0 ){
      jQuery.each(data, function(index, obj) {
        if( obj.key == key ){
          data.splice(index , 1);
          return false;
        }
      });
    }

    // Refresh items
    refreshItems();
    // Save data
    setData();
  }

  function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);

    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
  }

  function generate_item_key(str) {
      str = str.replace(/^\s+|\s+$/g, ''); // trim
      str = str.toLowerCase();

      // remove accents, swap ñ for n, etc
      var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
      var to   = "aaaaeeeeiiiioooouuuunc------";
      for (var i=0, l=from.length ; i<l ; i++) {
          str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
      }

      str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
          .replace(/\s+/g, '-') // collapse whitespace and replace by -
          .replace(/-+/g, '-'); // collapse dashes

      return str + '-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  function refreshItems(){
    var savedMessages = $('#savedMessages'),
        itemsContainer = $('#itemsContainer')
        itemsBox = $('#items');

    $(itemsContainer).addClass('masked');
    $(savedMessages).empty();

    if( data.length > 0 ){
      var itemTemplate = $(itemsBox).find('.template-item').clone(),
          itemTemplateHTML = $(itemTemplate).removeClass('template-item hidden').addClass('single-item')[0].outerHTML;


      jQuery.each(data, function(index, obj) {
          var key      = obj.key,
              title    = obj.title,
              message  = obj.message,
              item     = itemTemplateHTML;

          item = item.replace("{key}", key);
          item = item.replace("{title}", title);
          item = item.replace("{message}", message);

          $(savedMessages).append(item);
      });

      $('#noItems').addClass('hidden');
      $(itemsBox).removeClass('hidden');
    }else{
      $('#noItems').removeClass('hidden');
      $(itemsBox).addClass('hidden');
    }

    $(itemsContainer).removeClass('masked');
  }
  function runDomainProcesses(){
    let hostname = domain.hostname;
    if(
      hostname == 'app.codeable.io' ||
      hostname == 'mail.google.com' ||
      hostname == 'outlook.live.com'
    ){
      $('.insert-response.disabled').removeClass('disabled')
    }
  }
  function getDomain(){
    browser.tabs.query({currentWindow: true, active : true}).then( function(tabs){
      let activeTab = tabs[0];
      browser.tabs.sendMessage(activeTab.id, {"action": 'getURL'}).then( function(location){
            console.log(browser.runtime.lastError);
            if( ! browser.runtime.lastError ) {
              let url = new URL(location);
              domain = url;
              runDomainProcesses();
            }
          });
    });
  }
  function getData(){
    // Get and assign Data from the storage
    browser.storage.sync.get("messages").then(function(items){
      if( items.messages !== undefined && items.messages.length > 0 ){
        data = items.messages;
      }
      // refresh items view right away with the retrived data
      refreshItems();
    });
  }
  function setData(){
    // Set Json data in the storage
    browser.storage.sync.set({ "messages": data }).then(function(){
        console.log('messages Saved');
    });

  }

})(jQuery);
