const socket = io('ws:///002ttwclr1.execute-api.us-east-2.amazonaws.com/dev/');

const dom = {
    enterMessage: document.querySelector('.enter-message'),
    sendMessageButton: document.querySelector('.send-message-button'),
    enterUserNameButton: document.querySelector('.enter_username-button'),
    username: document.querySelector('.username'),
    enterUserName: document.querySelector('.enter-username'),
    userTyping: document.querySelector('.user-typing'),
    messageList: document.getElementById('message-list'),
};

const sendMessageSocket = (data) => {
    socket.emit('chat message', data);
}

const sendUsernameSocket = (data) => {
    socket.emit('user connected', data);
}

const getUserNameSocket = () => {
    socket.on( 'user connected', data => {
        checkUserName(data)
    })
}

const displayMessageSocket = () => {
    socket.on( 'chat message', data => {
        let date = new Date(Date.parse(data.date))
        let message = `${data.user.name}: ${data.message} @${date.getHours()}:${date.getMinutes()}`
        displayMessage(message)
    })
}

const userTypingEventSocket = () => {
    dom.enterMessage.onkeyup = e => {
        socket.emit('user typing')
        //if user presses enter to send messsage
        if (e.key.toLowerCase() === "enter") {
            sendMessage()
            e.target.value = '';
        }

        if(e.target.value === ''){

            socket.emit('user stopped typing')
        }
    }
}

const getUserIsTypingEventSocket = () => {
    socket.on('user typing', data => {
        getUserIsTypingEvent(data)
    })
}

const getUserIsLeavingGenChatSocket = () => {
    socket.on('leavegenchat', data => {
        displayNewJoinedUser(`${data} has left the chat`)
    })
}

const getUserIsTypingEvent = ({username, numberOfTypers}) => {

    dom.userTyping.style.display = "block";
    dom.userTyping.innerHTML = numberOfTypers > 2 ? 'Several people are typing' : `<i>${username}</i> is typing`;
}

const getUserStoppedTypingEventSocket = () => {
    socket.on('user stopped typing', data => {

        // if (!data) {
            getUserStoppedTypingEvent()
        // }

    })
}

const getUserStoppedTypingEvent = () => {
    console.log('jjjjj')
    dom.userTyping.innerHTML = ''
    dom.userTyping.style.display = "none";
}

const displayUserName = (data) => {
    let username = data.user.name
    displayNewJoinedUser(`${username} has joined the conversation`)
}

const checkUserName = (data) => {
    if (data.messages.length !== 0){
        const messageList = data.messages
        messageList.forEach(item => {
            let date = new Date(Date.parse(item.date))
            let message = `${item.user.name}: ${item.message} @${date.getHours()}:${date.getMinutes()}`
            let username = JSON.parse(localStorage.getItem(`username${data.user.id}`))
            if (item.user.name === username.name){
                let personalmessage = `${item.message}`
                displaySenderMessage(`me:${personalmessage} @${date.getHours()}:${date.getMinutes()}`)
            }else {
                displayMessage(message)
            }

        })
    }else{
        displayUserName(data)
        saveUser(data.user)
    }
}

let saveUser = (user) => {
    localStorage.setItem(`username${user.id}`, JSON.stringify(user));
}

const sendMessage = () => {
    let date = new Date()
    let userInput = dom.enterMessage.value
    let message = {
        date:date,
        message:userInput
    }
    sendMessageSocket(message)
    displaySenderMessage(`me: ${userInput} @${date.getHours()}:${date.getMinutes()}`)
    //clear field
    dom.enterMessage.value = ''

}

const hideMessageElement = () => {
   //remove message element
    dom.sendMessageButton.style.display = "none";
    dom.enterMessage.style.display = "none";
    dom.username.style.display = "none";
    dom.messageList.style.display = "none";
    dom.userTyping.style.display = "none";
}

const sendUserName = () => {
    //get username
    let userInput = dom.enterUserName.value
    sendUsernameSocket(userInput)
    hideUnhideMessage()
    displayPersonalJoinedUser( `Welcome ${userInput}, You have joined the conversation`)
}

function displayMessage(data) {
    var node = document.createElement("LI");
    var textnode = document.createTextNode(data);
    node.appendChild(textnode);
    dom.messageList.appendChild(node);
}

function displayNewJoinedUser(data) {
    var node = document.createElement("LI");
    var textnode = document.createTextNode(data);
    node.appendChild(textnode);
    dom.username.appendChild(node);
}

function displayPersonalJoinedUser(data) {
    var node = document.createElement("LI");
    node.classList.add("my-username");
    var textnode = document.createTextNode(data);
    node.appendChild(textnode);
    dom.username.appendChild(node);
}

function displaySenderMessage(data) {
    var node = document.createElement("LI");
    node.classList.add("personal-message");
    var textnode = document.createTextNode(data);
    node.appendChild(textnode);
    dom.messageList.appendChild(node);
}

const hideUnhideMessage = () => {
    dom.sendMessageButton.style.display = "inline";
    dom.enterMessage.style.display = "inline";
    dom.username.style.display = "block";
    dom.messageList.style.display = "block";
    dom.enterUserNameButton.style.display = "none";
    dom.enterUserName.style.display = "none";
}

const clickSendMessage = () => {
    sendMessage()
    socket.emit('user stopped typing')
}

hideMessageElement()
dom.sendMessageButton.addEventListener('click', clickSendMessage);
dom.enterUserNameButton.addEventListener('click', sendUserName);
getUserNameSocket()
userTypingEventSocket()
getUserIsTypingEventSocket()
getUserStoppedTypingEventSocket()
displayMessageSocket()
getUserIsLeavingGenChatSocket()
