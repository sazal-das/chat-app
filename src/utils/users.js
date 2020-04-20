const users = [];

//addUser
const addUser = ({id,username,room}) => {
    //Clean Data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Velidate data
    if(!username || !room){
        return {
            error: 'Username and Room required'
        }
    }

    //existing data
    const existing = users.find((user)=>{
        return user.room === room && user.username === username
    });

    if(existing){
        return {
            error: 'Username id Used'
        }
    }

    //Store data
    const user = {id,username,room}
    users.push(user);
    return {user};
}


//remove user
const removeUser = (id) => {
    const index = users.findIndex((user)=> user.id === id);
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

//get User
const getUser = (id) => {
    const user = users.find((user)=> user.id === id);
    if(!user){
        return undefined;
    }
    return user;
}

//getUsers in a room
const getUsersInRoom = (room) =>{
    room = room.trim().toLowerCase();
    return users.filter((user)=> user.room===room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}










