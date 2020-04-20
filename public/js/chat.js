const socket =  io();

//Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#massage-tamplate').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTamplate = document.querySelector('#sidebar-tamplate').innerHTML;

//Options
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix: true});

const autoScroll = ()=>{

    //new message element
    const $newMessage = $messages.lastElementChild;

    //new message Height
    const newMessageStyles = getComputedStyle($newMessage);
    const $newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + $newMessageMargin;

    //Visible Height
    const visibleHeight = $messages.offsetHeight;

    //Messages container height
    const containerHeight = $messages.scrollHeight;

    //How far to scroll
    const scrollOfset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOfset){
        $messages.scrollTop = $messages.scrollHeight;
    }

}

socket.on('welcomeMessage', (message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("ddd, h:mm a")
    });
    $messages.insertAdjacentHTML('beforeend', html);

    autoScroll();
    
})

socket.on('locationMessage', (url)=>{
    console.log(url);
    const html = Mustache.render(locationTemplate,{
        username: url.username,
        url: url.URL,
        createdAt: moment(url.createdAt).format("ddd, h:mm a")
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTamplate,{
        room,
        users
    });

    document.querySelector('#sidebar').innerHTML = html;

})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disable
    $messageFormButton.setAttribute('disabled','disabled');

   let msg = e.target.elements.message.value;

   socket.emit('sendMessage', msg, (error)=>{
        //enable
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus()

       if(error){
           return console.log(error);
       }
       console.log('Message Delivered');
       
   });
})

$sendLocation.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Your brwser does not support geolocation!!');
    }
    //disable
    $sendLocation.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=>{
            //enable
            $sendLocation.removeAttribute('disabled');
            console.log('Location Shared');
            
        })
        
        
       
    })
})

socket.emit('join', {username,room}, (error)=>{
    if(error){
        alert(error);
        location.href = '/';
    }
});
