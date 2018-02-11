const inquirer = require("inquirer");
const mysql = require("mysql");

const connection = mysql.createConnection({
	host: "localhost",
	port: "8889",
	user: "root",
	password: "root",
	database: "bamazon"
});

connection.connect(function(err){
	if(err) throw err;
	// console.log("connected as id " + connection.threadId);	
	 start();
});



const query = {
    'View Products for Sale': function()
    {
		connection.query('SELECT * FROM products', (err,res) =>
		{
			if(err) throw err; 
			console.log("\n-------------------------------------------------------------------------");
			for (var i = 0; i < res.length; i++) {
      			console.log("ID: " + res[i].item_id + " Product: " + res[i].product_name + ": $" + res[i].price + " Stock: " + res[i].stock_quantity);      		
    		}
    	});
	},
    'View Low Inventory': function()
    {
        connection.query('SELECT * FROM products WHERE stock_quantity < 5', (error,res) =>                                                                                             
        {
        	console.log("\n-------------------------------------------------------------------------");
        	for (var i = 0; i < res.length; i++) {
            	console.log("ID: " + res[i].item_id + " Product: " + res[i].product_name + ": $" + res[i].price + " Stock: " + res[i].stock_quantity);      		
        	}
        });
    },
    'Add to Inventory': function()
    {
    	console.log("add inventory");
    	query['View Products for Sale']();
    	inquirer.prompt([
                            {
                                name: 'itemID',
                                type: 'input',
                                message: 'Which item do you want to add stock to?'
                            },
                            {
                                name: 'itemQuantity',
                                type: 'input',
                                message: 'How much do you want to add?'
                            }
                        ]).then((answer) =>
	                        {
	                            connection.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE ?', 
	                            	[
	                            		answer.itemQuantity,
	                                	{
	                                    	item_id: answer.itemID
	                                	}
	                                ], 
	                            	(error,data) =>
	                                     {
                                            if(error)throw error;
	                                         console.log("Quantity has been updated.");
	                                     });
	                        });
    },
    'Add New Product': function()
    {
        inquirer.prompt([
                            {
                                name: 'newProduct',
                                type: 'input',
                                message: 'What is the product you would like to add?'
                            },
                            {
                                name: 'department',
                                type: 'input',
                                message: 'What department would you like to place this under?'
                            },
                            {
                                name: 'price',
                                type: 'input',
                                message: 'What is the price?'
                            },
                            {
                                name: 'quantity',
                                type: 'input',
                                message: 'How many do you have?'
                            }
                        ]).then((data) =>
                                {
                                    connection.query('INSERT INTO products SET ?', {
                                        product_name: data.newProduct,
                                        department_name: data.department,
                                        price: parseInt(data.price),
                                        stock_quantity: parseInt(data.quantity)
                                    }, (error,
                                         data) =>
                                                     {
                                                         console.log(data.affectedRows + " product inserted!\n");
                                                         console.log("Your item has been added!");
                                                     });
                                });
    }
};

function start(){
	inquirer.prompt(
	    [
	        {
	            name: 'query',
	            type: 'list',
	            message: 'What would you like to do?',
	            choices: ['View Products for Sale',
	                	  'View Low Inventory',
	                      'Add to Inventory',
	                      'Add New Product']
	        }
	    ]
	).then((data) =>
	       {
	           query[data.query]();
	           //doneReviewing();
	       }).catch((error) =>
	                {
	                    console.log(error);
	                });

}

function doneReviewing(){
	inquirer.prompt(
	    [
	        {
	            name: 'done',
	            type: 'confirm',
	            message: 'Are you done Reviewing?'	            
	        }
	    ]
	).then((answer) =>
	       {
				start();
	       });   
}

