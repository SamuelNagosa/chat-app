const generateMessage = (text)=>{
    return {
        text ,
        createdAt:new Date().getTime()
    }
}

const generateLocationMessage = (locationUrl)=>{
    return {
        locationUrl,
        createdAt:new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}