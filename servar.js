const express=require('express');
const bodyParser=require('body-parser');
const db= require('./database');

const app=express();
const PORT = 3000;
app.use(bodyParser.json());

//Record a transaction
app.post('/transactions', (req, res)=>{

    const {type, category, amount, date}=req.body;
    const sql='INSERT INTO transactions(type, category, amount, date) VALUES (?, ?, ?, ?)';

    db.run(sql, [type, category, amount, date], function(err) {
        if(err) {
            return res.status(500).json({error: err.message});
        }
        res.status(201).json({id: this.lastId});
    });
});

//Retrieve all transactions
app.get('/transactions', (req, res)=>{
    const sql='SELECT * FROM transactions';

    db.all(sql, [], (err, rows)=>{
        if (err) {
            return res.status(500).json({error:err.message});
        }
        res.json(rows);
    });
});

//Get summaries by category
app.get('/summaries/category', (req, res)=>{
    const sql='
    SELECT category, SUM(amount) AS total FROM transactions GROUP BY category';

    db.all(sql, [], (err, rows)=>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json(rows);
    });
});

//Get summaries by time period
app.get('/summaries/date', (req,res)=>{
    const {startDate, endDate}=req.query;
    const sql=' SELECT date, SUM(amount) AS total FROM transactions
    WHERE date BETWEEN ? AND ? GROUP BY date';

    db.all(sql, [startDate, endDate], (err, rows)=>{
        if(err){
            return res.status(500).json({error:err.message});
        }
        res.json(rows);
    });

});


//start the server

app.listen(PORT,()=>{
    console.log('Server is running on http://localhost:${PORT}');
});