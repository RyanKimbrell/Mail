document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

// Sends the email and loads Sent mailbox on submitting the form in Compose Email
document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('form').onsubmit = () => {

    event.preventDefault()

    // Get the email data to be sent
    const recipients = document.getElementById('compose-recipients').value;
    const subject = document.getElementById('compose-subject').value;
    const body = document.getElementById('compose-body').value;

    // Send the email
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
    })
    .then(() => load_mailbox('sent'));
  };
});


function compose_email() {

  // Show compose view and hide other views
  document.getElementById('emails-view').style.display = 'none';
  document.getElementById('compose-view').style.display = 'block';
  document.getElementById('individual-email-view').style.display = 'none';

  // Clear out composition fields
  document.getElementById('compose-recipients').value = '';
  document.getElementById('compose-subject').value = '';
  document.getElementById('compose-body').value = '';
}

function reply_email(email) {

  // Show compose view and hide other views
  document.getElementById('emails-view').style.display = 'none';
  document.getElementById('compose-view').style.display = 'block';
  document.getElementById('individual-email-view').style.display = 'none';

  // Clear out composition fields, and put the email to reply to in the body
  document.getElementById('compose-recipients').value = `${email.sender}`;
  document.getElementById('compose-subject').value = `Re: ${email.subject}`;
  document.getElementById('compose-body').value = `\n_______________________\nFrom: ${email.sender}\nTo: ${email.recipients}\nDate/Time: ${email.timestamp}\nSubject: ${email.subject}\nMessage: ${email.body}\n_______________________`;
}


function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.getElementById('emails-view').style.display = 'block';
  document.getElementById('compose-view').style.display = 'none';
  document.getElementById('individual-email-view').style.display = 'none';


  // Show the mailbox name
  document.getElementById('emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  // Get and diplay the emails


    if (mailbox === 'inbox') {
      fetch('/emails/inbox')
      .then(response => response.json())
      .then(emails => {
        // Print emails to the console
        console.log(emails);
        // Loop over each email in the array
        emails.forEach(email => {
          // As long as email is NOT archived...
          if (!email.archived) {
            // Make a div for each email and set the HTML
            const element = document.createElement('div');
            element.setAttribute("class", "row");
            element.setAttribute('id', `${email.id}`);
            element.innerHTML =`<div class="col-4">From: ${email.sender}</div>
                                <div class="col-4">Subject: ${email.subject}</div>
                                <div class="col-4">${email.timestamp}</div>`;
            element.addEventListener('click', () => display_email(email));
            document.getElementById('emails-view').append(element);
            
            // Color the read emails grey
            if (email.read) {
              document.getElementById(`${email.id}`).style.backgroundColor = "gainsboro";
            } 
          }
        });
      });
    } else if (mailbox === 'sent') {
      fetch('/emails/sent')
      .then(response => response.json())
      .then(emails => {
        // Print emails to the console
        console.log(emails);

        // Put email in its own list item and add to the page html
        emails.forEach(email => {

          const element = document.createElement('div');
          element.setAttribute("class", "row");
          element.innerHTML = `<div class="col-4">To: ${email.recipients}</div>
                               <div class="col-4">Subject: ${email.subject}</div>
                               <div class="col-4">${email.timestamp}`;
          element.addEventListener('click', () => display_email(email));
          document.getElementById('emails-view').append(element);

        });
      });
    } else if (mailbox === 'archive') {
      fetch('/emails/archive')
      .then(response => response.json())
      .then(emails => {
        // Print emails to the console
        console.log(emails);
        // Loop over each email in the array
        emails.forEach(email => {
          // As long as email IS archived...
          if (email.archived) {
            // Make a div for each email and set the HTML
            const element = document.createElement('div');
            element.setAttribute("class", "row");
            element.setAttribute('id', `${email.id}`);
            element.innerHTML =`<div class="col-4">From: ${email.sender}</div>
                                <div class="col-4">Subject: ${email.subject}</div>
                                <div class="col-4">${email.timestamp}</div>`
            element.addEventListener('click', () => display_email(email));
            document.getElementById('emails-view').append(element);
            // Color the read emails grey
            if (email.read) {
              document.getElementById(`${email.id}`).style.backgroundColor = "gainsboro";
            }
          }
        });
      });
    }
}


function archive_mail(email) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  .then(() => load_mailbox('inbox'));
}


function unarchive_mail(email) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  .then(() => load_mailbox('archive'))
}


function display_email(email) {
  console.log('This element has been clicked!');
  fetch(`/emails/${email.id}`)
  .then(response => response.json())
  .then(email => {
    // Log email to the console
    console.log(email);
    // Show the email and hide the other views
    document.getElementById('emails-view').style.display = 'none';
    document.getElementById('compose-view').style.display = 'none';
    document.getElementById('individual-email-view').style.display = 'block';
    // Clear out the div
    document.getElementById('individual-email-view').innerHTML = "";
    
    const read_email = document.createElement('div');
    read_email.setAttribute("class", "full_email");
    read_email.setAttribute("id", `${email.id}-individual`)
    read_email.innerHTML = `From: ${email.sender}<br>
                            To: ${email.recipients}<br>
                            Date/Time: ${email.timestamp}<br>
                            Subject: ${email.subject}<br>
                            Message: ${email.body}<br>`;
    
    // Add it to the HTML
    document.getElementById('individual-email-view').append(read_email);
    
    // Set up for Reply button
    const reply_button = document.createElement('div');
    reply_button.innerHTML = "<button class='button class='btn btn-sm btn-outline-primary' id='reply-button'>Reply</button>";
    document.getElementById('individual-email-view').append(reply_button);
    document.getElementById('reply-button').onclick = () => reply_email(email);

    // Set up for Archive button
    const archive_button = document.createElement('div');
    archive_button.innerHTML = "<button class='btn btn-sm btn-outline-primary' id='archive-button'>Archive</button>";

    // Set up for Unarchive button
    const unarchive_button = document.createElement('div');
    unarchive_button.innerHTML = "<button class-'btn btn-sm btn-outline-primary' id='unarchive-button'>Un-Archive</button>";

    // Add the corresponding button to the page depending on archive status
    if (!email.archived){
      document.getElementById('individual-email-view').append(archive_button);
      document.getElementById('archive-button').onclick = () => archive_mail(email);
    } else if (email.archived){
      document.getElementById('individual-email-view').append(unarchive_button);
      document.getElementById('unarchive-button').onclick = () => unarchive_mail(email);
    }
  
    // Mark the email as read
    fetch(`emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    })
  });
}