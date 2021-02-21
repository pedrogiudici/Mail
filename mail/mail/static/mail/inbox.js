document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());
  document.querySelector('#submit').addEventListener('click', submit);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(to= '', subject= '', bodyr= '') {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#content-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = to;
  document.querySelector('#compose-subject').value = subject;
  if (bodyr !== ''){
    bodyr.replace('\n','')
    document.querySelector('#forbodyr').innerHTML = ''
    let bor = document.createElement('p')
    bor.style.whiteSpace = 'pre-line'
    bor.innerHTML = bodyr
    bor.id = 'bodyr'
    document.querySelector('#forbodyr').insertAdjacentElement('beforeend', bor)
  }
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#content-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(email => {
    email.forEach(element => {
      const div = document.createElement('div')
      div.className = 'diva'
      div.onclick =  function () {
        document.querySelector('#content-view').style.display = 'block';
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'none';
        fetch(`/emails/${element.id}`)
        .then(response => response.json())
        .then(email => {
          document.querySelector('#content-view').innerHTML = `<div><strong>From:</strong> ${email.sender}</div>`
          document.querySelector('#content-view').innerHTML += `<div><strong>To:</strong> ${email.recipients}</div>`
          document.querySelector('#content-view').innerHTML += `<div><strong>Subject:</strong> ${email.subject}</div>`
          document.querySelector('#content-view').innerHTML += `<div><strong>Timestamp:</strong> ${email.timestamp}</div>`
          if (email.sender != document.querySelector('#useremail').innerText){
            const but = document.createElement('button')
            but.className = 'btn btn-sm btn-outline-primary'
            but.innerHTML = 'Reply'
            but.onclick = function(){
              let subject = ''
              if (String(email.subject).startsWith('Re: ')) {
                subject = email.subject
              } else {
                subject = `Re: ${email.subject}`
              }
              const bodyr = `${email.timestamp} ${email.sender} wrote:\n${email.body}`
              compose_email(email.sender, subject, bodyr)
            }
            document.querySelector('#content-view').appendChild(but)
          }
          document.querySelector('#content-view').insertAdjacentHTML('beforeend', `<hr><p style="white-space: pre-line">${email.body}</p>`)
        })
        fetch(`/emails/${element.id}`,{
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
      }
      if (element.read === true) {
        div.style.backgroundColor = 'rgb(219, 219, 219)'
      }
      const div1 = document.createElement('div')
      if (mailbox === 'sent'){
        div1.innerHTML = element.recipients
      } else {
        div1.innerHTML = element.sender
      }
      div1.className = 'divb'
      const div2 = document.createElement('div')
      div2.innerHTML = element.subject
      div2.className = 'divc'
      const div3 = document.createElement('div')
      div3.innerHTML = element.timestamp
      div3.className = 'divd'
      div.appendChild(div1)
      div.appendChild(div2)
      div.appendChild(div3)
      if (mailbox === 'inbox' || mailbox === 'archive'){
        const div4 = document.createElement('div')
        div4.className = 'dive'
        div4.style.backgroundColor = div.style.backgroundColor
        function archive (ft) {
          fetch(`/emails/${element.id}`,{
            method: 'PUT',
            body: JSON.stringify({
              archived: ft
            })
          })
          .then(() => {
            load_mailbox('inbox')
          })
        }
        if (mailbox === 'inbox'){
          div4.innerHTML= 'Archive'
          div4.onclick = () => archive(true)
        } else{
          div4.innerHTML= 'Unarchive'
          div4.onclick = () => archive(false)
        }
        document.querySelector('#emails-view').appendChild(div4)
      }
      document.querySelector('#emails-view').appendChild(div)
    });
  })
}

function submit() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: `${document.querySelector('#compose-body').value}\n${document.querySelector('#forbodyr').innerText}`
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result)
    if (result.message) {
      load_mailbox('sent')
    } else {
      load_mailbox('inbox')
    }
  })
}