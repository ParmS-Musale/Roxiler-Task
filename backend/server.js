const express  = require ('express');

const app = express();
const PORT = 5000 ;

app.listen((req,res) => {
    console.log(`Sever is Running on ${PORT}`);
    
})